const jwt = require('jsonwebtoken');
const db = require('../database');
const { AppError } = require('./errorHandler');

const getToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await db.users.findById(decoded.id);
    if (!req.user) {
      return next(new AppError('User not found', 401));
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired, please login again', 401));
    }
    return next(new AppError('Not authorized, token failed', 401));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Not authorized as admin', 403));
  }
};

const delivery = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'delivery')) {
    next();
  } else {
    next(new AppError('Not authorized as delivery partner', 403));
  }
};

const optionalAuth = async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await db.users.findById(decoded.id);
    } catch (e) {
      // Silently continue without auth
    }
  }
  next();
};

module.exports = { protect, admin, delivery, optionalAuth };
