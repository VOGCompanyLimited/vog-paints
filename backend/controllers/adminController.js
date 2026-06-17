const db = require('../database');

exports.getDashboard = async (req, res) => {
  try {
    const totalOrders = await db.orders.countDocuments();
    const allOrders = await db.orders.find({});
    const totalRevenue = allOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const allUsers = await db.users.find({});
    const totalUsers = allUsers.filter(u => u.role === 'customer').length;
    const totalProducts = await db.products.countDocuments({ isActive: true });

    const allWithUsers = [];
    for (const o of allOrders.slice(0, 5)) {
      const u = await db.users.findById(o.user);
      allWithUsers.push({ ...o, user: u || { name: 'Unknown' } });
    }

    const statusCounts = {};
    allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    const ordersByStatus = Object.entries(statusCounts).map(([_id, count]) => ({ _id, count }));

    res.json({
      stats: { totalOrders, totalRevenue, totalUsers, totalProducts },
      recentOrders: allWithUsers,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await db.orders.countDocuments(query);
    const orders = await db.orders.find(query, { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit: Number(limit) });
    const enriched = [];
    for (const o of orders) {
      const u = await db.users.findById(o.user);
      const p = o.deliveryPartner ? await db.users.findById(o.deliveryPartner) : null;
      enriched.push({ ...o, user: u || { name: 'Unknown' }, deliveryPartner: p });
    }
    res.json({ orders: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, deliveryPartnerId } = req.body;
    const order = await db.orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const update = { status };
    if (deliveryPartnerId) update.deliveryPartner = deliveryPartnerId;
    if (status === 'delivered') update.deliveredAt = new Date().toISOString();
    order.tracking = order.tracking || [];
    order.tracking.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` });
    update.tracking = order.tracking;
    await db.orders.update({ _id: req.params.id }, update);
    const updated = await db.orders.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await db.users.find({}, { sort: { createdAt: -1 } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const target = await db.users.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'admin') {
      return res.status(403).json({ message: 'Admin role is permanent and cannot be changed' });
    }
    await db.users.update({ _id: req.params.id }, { role: req.body.role });
    const user = await db.users.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeliveryPartners = async (req, res) => {
  try {
    const allUsers = await db.users.find({});
    const partners = allUsers.filter(u => u.role === 'delivery' || u.role === 'admin').map(u => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role }));
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ALL_CATEGORIES = ['interior', 'exterior', 'wood', 'metal'];

exports.createColor = async (req, res) => {
  try {
    const { name, hex, family, categories } = req.body;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const valid = Array.isArray(categories) ? categories.filter(c => ALL_CATEGORIES.includes(c)) : ALL_CATEGORIES;
    const color = await db.colors.create({ name, hex: hex.toLowerCase(), family, rgb: [r, g, b], categories: valid });
    res.status(201).json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateColor = async (req, res) => {
  try {
    const color = await db.colors.findOne({ _id: req.params.id });
    if (!color) return res.status(404).json({ message: 'Color not found' });
    const { name, hex, family, categories } = req.body;
    const update = {};
    if (name) update.name = name;
    if (hex) { update.hex = hex.toLowerCase(); const h = hex.replace('#',''); update.rgb = [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
    if (family) update.family = family;
    if (categories) update.categories = categories.filter(c => ALL_CATEGORIES.includes(c));
    await db.colors.update({ _id: req.params.id }, update);
    const updated = await db.colors.findOne({ _id: req.params.id });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteColor = async (req, res) => {
  try {
    const color = await db.colors.findOne({ _id: req.params.id });
    if (!color) return res.status(404).json({ message: 'Color not found' });
    await db.colors.remove({ _id: req.params.id });
    res.json({ message: 'Color deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.mixColors = async (req, res) => {
  try {
    const { colors } = req.body;
    if (!colors || colors.length < 2) {
      return res.status(400).json({ message: 'At least 2 colors required' });
    }
    if (colors.length > 6) {
      return res.status(400).json({ message: 'Maximum 6 colors allowed' });
    }
    let totalWeight = 0;
    let r = 0, g = 0, b = 0;
    for (const c of colors) {
      const weight = c.proportion || 1;
      totalWeight += weight;
      r += c.rgb[0] * weight;
      g += c.rgb[1] * weight;
      b += c.rgb[2] * weight;
    }
    r = Math.round(r / totalWeight);
    g = Math.round(g / totalWeight);
    b = Math.round(b / totalWeight);
    const hex = '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
    res.json({ hex, rgb: [r, g, b], name: 'Custom Mix' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await db.products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const updated = await db.products.findByIdAndUpdate(req.params.id, { isActive: !product.isActive }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogo = async (req, res) => {
  try {
    const setting = await db.settings.findOne({ key: 'logo' });
    res.json({ logo: setting?.value || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLogo = async (req, res) => {
  try {
    const existing = await db.settings.findOne({ key: 'logo' });
    if (existing) {
      await db.settings.update({ key: 'logo' }, { value: req.body.url });
    } else {
      await db.settings.create({ key: 'logo', value: req.body.url });
    }
    res.json({ logo: req.body.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    await db.settings.remove({ key: 'logo' });
    res.json({ message: 'Logo removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await db.products.find({}, { sort: { createdAt: -1 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
