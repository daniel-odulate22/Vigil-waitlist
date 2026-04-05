const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');
const waitlistRoutes = require('./routes/waitlistRoutes');

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  // Local development — all common ports
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'https://vigilhealth-waitlist.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // In development, allow any localhost origin automatically
    if (
      process.env.NODE_ENV !== 'production' &&
      (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn(`CORS blocked request from: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-admin-key'],
}));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── General rate limiter ─────────────────────────────────────
app.use('/api', generalLimiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/waitlist', waitlistRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Vigil Health API' });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;