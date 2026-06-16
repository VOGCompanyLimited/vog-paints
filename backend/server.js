require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { validateEnv, getCorsOrigins } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitize } = require('./middleware/validate');
const { connectDB } = require('./config/db');

validateEnv();

const app = express();

/* ── Security Headers ── */
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://maps.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* ── Compression ── */
app.use(compression());

/* ── CORS ── */
const corsOrigins = getCorsOrigins();
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400
}));

/* ── Rate Limiting ── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

/* ── Body Parsing ── */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser(process.env.JWT_SECRET));

/* ── NoSQL Injection Prevention ── */
app.use(mongoSanitize());

/* ── HTTP Parameter Pollution Protection ── */
app.use(hpp());

/* ── XSS Sanitization ── */
app.use('/api/', sanitize);

/* ── Static Files ── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=604800');
  }
}));

/* ── Trust Proxy (for reverse proxy setups like Nginx) ── */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/* ── API Routes ── */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/colors', require('./routes/colors'));
app.use('/api/upload', require('./routes/upload'));

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

/* ── Serve Frontend in Production ── */
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

/* ── Error Handling ── */
app.use(notFoundHandler);
app.use(errorHandler);

/* ── HTTPS Certificate Setup ── */
const certDir = path.join(__dirname, 'ssl');
const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.cert');

let httpsOptions = null;
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
}

/* ── Start Server ── */
const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

async function start() {
  await connectDB();

  /* HTTP Server (always) */
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, () => {
    console.log(`[HTTP]  Server running on http://localhost:${HTTP_PORT}`);
  });

  /* HTTPS Server (if certs exist) */
  if (httpsOptions) {
    try {
      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`[HTTPS] Server running on https://0.0.0.0:${HTTPS_PORT}`);
      });
      httpsServer.on('error', (err) => {
        console.warn(`[HTTPS] Failed to start HTTPS server: ${err.message}. HTTP only.`);
      });
    } catch (err) {
      console.warn(`[HTTPS] Invalid SSL certificates: ${err.message}`);
      console.warn('[HTTPS] Run "node scripts/generate-ssl.js" to regenerate certificates.');
      console.warn('[HTTPS] Falling back to HTTP only.');
      httpsOptions = null;
    }
  }

  /* HTTP → HTTPS redirect for production */
  if (process.env.NODE_ENV === 'production' && httpsOptions) {
    app.use((req, res, next) => {
      if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  const protocol = httpsOptions ? 'https' : 'http';
  const port = httpsOptions ? HTTPS_PORT : HTTP_PORT;
  console.log(`\n  PaintMarket API is LIVE`);
  console.log(`  URL:  ${protocol}://localhost:${port}`);
  console.log(`  Mode: ${process.env.NODE_ENV || 'development'}\n`);
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
