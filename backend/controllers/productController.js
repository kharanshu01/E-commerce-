const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/products?search=&category=&sort=&page=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(60, parseInt(req.query.limit) || 12);

  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (req.query.featured === 'true') filter.featured = true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/products/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories.sort());
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });

  const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(3);
  res.json({ product, related });
});

// POST /api/products   (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PUT /api/products/:id   (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json(product);
});

// DELETE /api/products/:id   (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product removed.' });
});
