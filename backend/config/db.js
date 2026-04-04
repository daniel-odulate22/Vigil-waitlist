const mongoose = require('mongoose');

// Cache the connection across serverless invocations.
// Vercel spins up new function instances but reuses warm ones.
// This prevents opening a new connection on every single request.
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if already open
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;const mongoose = require('mongoose');

// Cache the connection across serverless invocations.
// Vercel spins up new function instances but reuses warm ones.
// This prevents opening a new connection on every single request.
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if already open
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;