const mongoose = require('mongoose');
const dns = require('dns');

// Fix: Node.js DNS resolver doesn't work with SRV records on some networks
// Force Google DNS servers for SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Server will continue without database. Some features may not work.');
  }
};

module.exports = connectDB;
