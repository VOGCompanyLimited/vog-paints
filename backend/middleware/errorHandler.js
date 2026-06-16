class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err.name === 'ValidationError') { statusCode = 400; message = err.message; }
  if (err.code === 'LIMIT_FILE_SIZE') { statusCode = 400; message = 'File too large (max 5MB)'; }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { statusCode = 401; message = 'Invalid or expired token'; }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack || '');
  }

  const response = { success: false, message };
  if (details) response.details = details;
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { AppError, errorHandler, notFoundHandler };
