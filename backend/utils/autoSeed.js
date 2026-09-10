const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { products } = require('../data/seedData');

/**
 * Seed the database only if it is empty. Runs automatically on server boot so
 * that a fresh (or in-memory) database always has products and an admin login.
 */
module.exports = async function autoSeed() {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(products);
    console.log(`🌱 Auto-seeded ${products.length} sample products.`);
  } else {
    const existing = await Product.find({}, { name: 1 }).lean();
    const knownNames = new Set(existing.map((product) => product.name));
    const missing = products.filter((product) => !knownNames.has(product.name));
    if (missing.length) {
      await Product.insertMany(missing);
      console.log(`🌱 Added ${missing.length} new catalog products.`);
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fashionhub.com').toLowerCase();
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });
    console.log(`🌱 Auto-created admin account: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  }

  const demoExists = await User.findOne({ email: 'user@fashionhub.com' });
  if (!demoExists) {
    await User.create({ name: 'Demo User', email: 'user@fashionhub.com', password: 'user123', role: 'user' });
    console.log('🌱 Auto-created demo user: user@fashionhub.com / user123');
  }

  await Coupon.updateOne(
    { code: 'WELCOME10' },
    { $setOnInsert: { code: 'WELCOME10', discountPercent: 10, minOrderValue: 500, expiresAt: new Date('2099-12-31'), active: true } },
    { upsert: true }
  );
};
