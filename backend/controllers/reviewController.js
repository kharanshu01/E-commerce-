const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/asyncHandler');

async function refreshProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', rating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  const result = stats[0] || { rating: 0, numReviews: 0 };
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(result.rating * 10) / 10,
    numReviews: result.numReviews,
  });
}

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const { rating, title, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: 'Rating and comment are required.' });

  const purchased = await Order.exists({
    user: req.user._id,
    status: 'Delivered',
    'items.product': productId,
  });
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    verifiedPurchase: Boolean(purchased),
  });
  await refreshProductRating(productId);
  await review.populate('user', 'name');
  res.status(201).json(review);
});

exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { $inc: { helpful: 1 } }, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  res.json(review);
});
