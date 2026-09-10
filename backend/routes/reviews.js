const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getReviews, createReview, markHelpful } = require('../controllers/reviewController');

router.get('/product/:productId', getReviews);
router.post('/product/:productId', protect, createReview);
router.post('/:id/helpful', markHelpful);

module.exports = router;
