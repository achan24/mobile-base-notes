require('dotenv').config();
const mongoose = require('mongoose');

console.log('Connecting to:', process.env.MONGODB_URI); // Debug output

async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connection successful!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

testMongoConnection();
