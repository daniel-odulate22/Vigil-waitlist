const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');
const waitlistRoutes = require('./routes/waitlistRoutes');
 
const app = express();
 
// ── Security headers ─────────────────────────────────────────
app.use(helmet());
 
// ── CORS ─────────────────────────────────────────────────────
// In development, CLIENT_URL is your local HTML file server
// In production, set CLIENT_URL to your deployed frontend domain
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  // Add your production domain here when you deploy, e.g.:
  // 'https://vigilhealth.com',
];
 
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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
// Never expose stack traces to the client
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});
 
module.exports = app;
 