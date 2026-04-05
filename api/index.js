// Vercel Serverless Function entry point.
// Vercel injects environment variables automatically in production.
// dotenv is only needed locally — this handles both cases safely.
try { require('dotenv').config(); } catch (e) {}

const app = require('../backend/app');
const connectDB = require('../backend/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
  } catch (err) {
    console.error('DB connection failed in serverless fn:', err.message);
    return res.status(500).json({ success: false, message: 'Database connection failed.' });
  }

  return app(req, res);
};