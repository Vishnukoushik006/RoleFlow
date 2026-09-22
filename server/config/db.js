const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobtrack';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    isConnected = true;
    const host = conn.connection.host;
    const dbName = conn.connection.name;
    const isAtlas = host.includes('mongodb.net');
    console.log(`[Database] Connected → ${isAtlas ? 'Atlas' : 'Local'} / ${dbName} (${host})`);

    // Handle connection drops gracefully
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Disconnected. Attempting reconnect…');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] Reconnected successfully.');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
    console.error(`[Database] Connection failed: ${error.message}`);
    if (isLocal) {
      console.warn('[Database] Tip: Start MongoDB with → brew services start mongodb-community');
      console.warn('[Database] Or use a free Atlas cluster → https://cloud.mongodb.com');
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev/test, log and continue so the server still starts for health checks
  }
};

module.exports = connectDB;
