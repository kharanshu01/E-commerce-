/**
 * Central error-handling middleware. Converts common Mongoose errors into
 * friendly messages and returns consistent JSON.
 */
module.exports = function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || { field: '' })[0];
    message = `${field} already exists.`;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error(err);
  }

  res.status(status).json({ message });
};
