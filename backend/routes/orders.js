const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateStatus,
  cancelOrder,
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
