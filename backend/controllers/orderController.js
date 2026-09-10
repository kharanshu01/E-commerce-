const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../middleware/asyncHandler');

const TAX_RATE = 0.05; // 5% demo VAT
const FREE_SHIP_THRESHOLD = 500;
const SHIP_FLAT = 40;

/**
 * Recompute totals on the server from real product prices so the client
 * cannot tamper with the amount charged.
 */
async function buildOrderItems(clientItems) {
  const ids = clientItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const ci of clientItems) {
    const p = map.get(String(ci.product));
    if (!p) continue;
    const qty = Math.max(1, parseInt(ci.qty) || 1);
    items.push({ product: p._id, name: p.name, image: p.image, price: p.price, qty });
  }
  return items;
}

// POST /api/orders   (protected) — create order (simulated payment)
exports.createOrder = asyncHandler(async (req, res) => {
  const { items: clientItems, shipping, paymentMethod = 'Cash on Delivery', couponCode } = req.body;
  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }

  const items = await buildOrderItems(clientItems);
  if (items.length === 0) return res.status(400).json({ message: 'No valid products in cart.' });

  const stockResult = await Product.bulkWrite(items.map((item) => ({
    updateOne: {
      filter: { _id: item.product, countInStock: { $gte: item.qty } },
      update: { $inc: { countInStock: -item.qty } },
    },
  })));
  if (stockResult.modifiedCount !== items.length) {
    return res.status(409).json({ message: 'One or more products are no longer available in the requested quantity.' });
  }

  const itemsPrice = items.reduce((s, i) => s + i.price * i.qty, 0);
  let discountPrice = 0;
  let appliedCoupon = '';
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true, expiresAt: { $gt: new Date() } });
    if (!coupon) return res.status(400).json({ message: 'Coupon is invalid or expired.' });
    if (itemsPrice < coupon.minOrderValue) return res.status(400).json({ message: `This coupon requires a minimum order of ₹${coupon.minOrderValue}.` });
    discountPrice = Math.round(itemsPrice * coupon.discountPercent / 100 * 100) / 100;
    appliedCoupon = coupon.code;
  }
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const shippingPrice = itemsPrice >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
  const totalPrice = Math.round((itemsPrice - discountPrice + taxPrice + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items,
    shipping: shipping || {},
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    discountPrice,
    couponCode: appliedCoupon,
    paymentMethod,
    isPaid: paymentMethod !== 'Cash on Delivery',
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
    paidAt: paymentMethod === 'Cash on Delivery' ? undefined : new Date(),
    transactionId: paymentMethod === 'Cash on Delivery' ? '' : `DEMO-${Date.now()}`,
    status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Processing',
  });

  // Clear the user's server-side cart after a successful order.
  req.user.cart = [];
  await req.user.save();

  res.status(201).json(order);
});

// GET /api/orders/mine   (protected)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id   (protected — owner or admin)
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const isOwner = String(order.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order.' });
  }
  res.json(order);
});

// GET /api/orders   (admin) — all orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// PUT /api/orders/:id/status   (admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, courier } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  order.status = status || order.status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (courier !== undefined) order.courier = courier;
  if (order.status === 'Delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  await order.save();
  res.json(order);
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!['Pending', 'Processing'].includes(order.status)) {
    return res.status(409).json({ message: 'This order can no longer be cancelled.' });
  }
  order.status = 'Cancelled';
  await order.save();
  await Product.bulkWrite(order.items.map((item) => ({
    updateOne: { filter: { _id: item.product }, update: { $inc: { countInStock: item.qty } } },
  })));
  res.json(order);
});
