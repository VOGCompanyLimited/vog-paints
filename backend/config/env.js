const REQUIRED_ENV = ['JWT_SECRET'];
const DEV_ENV = ['PORT', 'CLIENT_URL'];

const validateEnv = () => {
  const missing = [];
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Using development fallback values. DO NOT use in production!');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    process.env.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
    console.warn('WARNING: Auto-generated JWT secret. Set JWT_SECRET in .env for persistent sessions.');
  }
  if (!process.env.CLIENT_URL) process.env.CLIENT_URL = 'http://localhost:5173';
  if (!process.env.PORT) process.env.PORT = '5000';
  if (!process.env.JWT_EXPIRE) process.env.JWT_EXPIRE = '7d';
};

const getCorsOrigins = () => {
  const origins = [process.env.CLIENT_URL];
  if (process.env.CLIENT_URL_2) origins.push(process.env.CLIENT_URL_2);
  if (process.env.NODE_ENV === 'development') origins.push('http://localhost:5173', 'http://localhost:5000');
  return origins;
};

module.exports = { validateEnv, getCorsOrigins };
