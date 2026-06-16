const db = require('../database');

exports.getProducts = async (req, res) => {
  try {
    const { category, color, colorFamily, finish, search, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    let query = {};
    if (category) query.category = { $regex: category, $options: 'i' };
    if (color) query.color = { $regex: color, $options: 'i' };
    if (colorFamily) query.colorFamily = colorFamily;
    if (finish) query.finish = finish;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const total = await db.products.countDocuments(query);
    const skip = (page - 1) * limit;
    const products = await db.products.find(query, { sort: sortOption, skip: Number(skip), limit: Number(limit) });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await db.products.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const allReviews = await db.reviews.find({ product: product._id });
    const reviews = [];
    for (const r of allReviews) {
      const user = await db.users.findById(r.user);
      reviews.push({ ...r, user: user ? { name: user.name, avatar: user.avatar } : { name: 'Anonymous' } });
    }

    const allProducts = await db.products.find({ category: product.category });
    const related = allProducts.filter(p => p._id !== product._id).slice(0, 6);

    res.json({ product, reviews, related });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await db.products.find({ isFeatured: true }, { limit: 12 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getColors = async (req, res) => {
  try {
    const { family } = req.query;
    let query = {};
    if (family) query.family = family;
    const colors = await db.colors.find(query, { sort: { name: 1 } });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getColorByHex = async (req, res) => {
  try {
    const color = await db.colors.findOne({ hex: `#${req.params.hex}` });
    if (!color) return res.status(404).json({ message: 'Color not found' });
    const products = await db.products.find({ colorHex: color.hex }, { limit: 12 });
    res.json({ color, products });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await db.products.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await db.products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await db.products.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await db.products.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = await db.reviews.findOne({ user: req.user._id, product: req.params.productId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this product' });

    const review = await db.reviews.create({
      user: req.user._id,
      product: req.params.productId,
      rating, title, comment
    });

    const allReviews = await db.reviews.find({ product: req.params.productId });
    const numReviews = allReviews.length;
    const avgRating = numReviews > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
    await db.products.update({ _id: req.params.productId }, { numReviews, rating: avgRating });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
