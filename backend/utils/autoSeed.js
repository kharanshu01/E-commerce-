const User = require('../models/User');
const Product = require('../models/Product');
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
};
