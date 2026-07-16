const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  me,
  getCart,
  saveCart,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.get('/cart', protect, getCart);
router.put('/cart', protect, saveCart);

module.exports = router;
