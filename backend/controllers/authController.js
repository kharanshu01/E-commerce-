const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  res
    .cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
    .status(201)
    .json({ token, user: sanitize(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user._id);
  res
    .cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
    .json({ token, user: sanitize(user) });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out.' });
});

// GET /api/auth/me   (protected)
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

// GET /api/auth/cart   (protected) — server-persisted cart with product details
exports.getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  const cart = (user.cart || [])
    .filter((c) => c.product) // drop products that were deleted
    .map((c) => ({ product: c.product, qty: c.qty }));
  res.json(cart);
});

// PUT /api/auth/cart   (protected) — replace cart with [{ product, qty }]
exports.saveCart = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  req.user.cart = items
    .filter((i) => i.product)
    .map((i) => ({ product: i.product, qty: Math.max(1, parseInt(i.qty) || 1) }));
  await req.user.save();
  res.json({ message: 'Cart saved.', count: req.user.cart.length });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json((user.wishlist || []).filter(Boolean));
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const index = req.user.wishlist.findIndex((id) => String(id) === productId);
  if (index >= 0) req.user.wishlist.splice(index, 1);
  else req.user.wishlist.push(productId);
  await req.user.save();
  res.json({ saved: index < 0, count: req.user.wishlist.length });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  res.json(req.user.addresses || []);
});

exports.saveAddress = asyncHandler(async (req, res) => {
  const address = req.body;
  if (!address.address1 || !address.city || !address.postcode || !address.country) {
    return res.status(400).json({ message: 'Address, city, postcode and country are required.' });
  }
  if (address.isDefault) req.user.addresses.forEach((item) => { item.isDefault = false; });
  req.user.addresses.push(address);
  await req.user.save();
  res.status(201).json(req.user.addresses[req.user.addresses.length - 1]);
});

// GET /api/auth/users (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});
