require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const autoSeed = require('./utils/autoSeed');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

/* ----------------------------- Core middleware ---------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

/* -------------------------------- API routes ------------------------------ */
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/* --------------------- Serve the frontend (single origin) ----------------- */
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Any non-API GET falls back to the frontend (nice for direct links).
app.get(/^\/(?!api).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDir, 'index.html'), (err) => (err ? next() : null));
});

/* ---------------------------- Error handling ------------------------------ */
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

/* --------------------------------- Boot ----------------------------------- */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await autoSeed();
    app.listen(PORT, () => {
      console.log(`🚀 FashionHub server running at http://localhost:${PORT}`);
      console.log(`   Open the site:      http://localhost:${PORT}`);
      console.log(`   API health check:   http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });

module.exports = app;
