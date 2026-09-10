const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    qty: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    shipping: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
      country: String,
      address1: String,
      address2: String,
      postcode: String,
      city: String,
      notes: String,
    },
    itemsPrice: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    transactionId: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    trackingNumber: { type: String, default: '' },
    courier: { type: String, default: '' },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
