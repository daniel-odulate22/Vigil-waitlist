// This is the Vercel Serverless Function entry point.
// Vercel calls this file on every /api/* request.
// It wraps your existing Express app — no rewrite needed.

require('dotenv').config();
const app = require('../backend/app');
const connectDB = require('../backend/config/db');

// Cache the DB connection across serverless invocations.
// Without this, every request would open a new MongoDB connection
// and you would hit Atlas's connection limit very quickly.
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};