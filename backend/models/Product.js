const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    price: { type: Number, min: 0 },
    countInStock: { type: Number, min: 0, default: 0 },
    image: { type: String, default: '' },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    brand: { type: String, default: '', trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    mrp: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    category: { type: String, required: true, index: true, trim: true },
    image: { type: String, default: 'assets/images/product1.svg' },
    images: [{ type: String }],
    variants: [variantSchema],
    tags: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    countInStock: { type: Number, default: 20, min: 0 },
    returnWindow: { type: Number, default: 30, min: 0 },
    warranty: { type: String, default: '' },
    deliveryInfo: { type: String, default: 'Delivery in 3-5 business days' },
    isNew: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Simple text index so search can match name/description/category.
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
