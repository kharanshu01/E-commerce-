require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { products } = require('./data/seedData');

/**
 * Manual seed: wipes and repopulates the database.
 * Note: with the in-memory fallback DB, data only lives for a running server,
 * so the server also auto-seeds on boot. Use this against a real MongoDB.
 */
async function run() {
  await connectDB();
  console.log('🌱 Seeding database (wipe + repopulate)...');

  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

  await Product.insertMany(products);
  console.log(`   Inserted ${products.length} products.`);

  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@fashionhub.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  });
  console.log(`   Admin: ${process.env.ADMIN_EMAIL || 'admin@fashionhub.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);

  await User.create({ name: 'Demo User', email: 'user@fashionhub.com', password: 'user123', role: 'user' });
  console.log('   Demo user: user@fashionhub.com / user123');

  console.log('✅ Seed complete.');
  await mongoose.connection.close();
  if (global.__MEM_DB__) await global.__MEM_DB__.stop();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
