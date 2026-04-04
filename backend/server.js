require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { verifyEmailTransport } = require('./services/emailService');
 
const PORT = process.env.PORT || 5001;
 
const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();
 
  // Verify email transport (warns if credentials are wrong, does not crash)
  await verifyEmailTransport();
 
  // Start Express
  app.listen(PORT, () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vigil Health API running
  Port:    ${PORT}
  Mode:    ${process.env.NODE_ENV || 'development'}
  Health:  http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
};
 
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});