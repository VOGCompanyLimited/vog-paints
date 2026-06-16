const db = require('../database');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await db.products.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: (product.images && product.images[0]) || '',
        color: product.color
      });
    }

    const deliveryFee = subtotal >= 200 ? 0 : 25;
    const total = subtotal + deliveryFee;

    const order = await db.orders.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      currency: 'GHS',
      status: 'pending',
      paymentStatus: 'pending',
      notes,
      tracking: [{ status: 'pending', location: 'Order placed', timestamp: new Date().toISOString() }]
    });

    for (const item of items) {
      const product = await db.products.findById(item.productId);
      await db.products.update({ _id: item.productId }, { stock: product.stock - item.quantity });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await db.orders.find({ user: req.user._id }, { sort: { createdAt: -1 } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await db.orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const orderUser = await db.users.findById(order.user);
    const partner = order.deliveryPartner ? await db.users.findById(order.deliveryPartner) : null;
    if (order.user !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ ...order, user: orderUser, deliveryPartner: partner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await db.orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    order.status = 'cancelled';
    order.tracking = order.tracking || [];
    order.tracking.push({ status: 'cancelled', timestamp: new Date().toISOString(), note: 'Cancelled by customer' });
    await db.orders.update({ _id: req.params.id }, { status: 'cancelled', tracking: order.tracking });
    const updated = await db.orders.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmBankPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const order = await db.orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.paymentStatus = 'paid';
    order.bankPaymentDetails = { reference, verifiedBy: req.user._id };
    order.tracking = order.tracking || [];
    order.tracking.push({ status: 'payment_confirmed', timestamp: new Date().toISOString(), note: 'Bank payment confirmed' });
    await db.orders.update({ _id: req.params.id }, { paymentStatus: 'paid', bankPaymentDetails: order.bankPaymentDetails, tracking: order.tracking });
    const updated = await db.orders.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
