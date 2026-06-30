import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<user>')) {
    console.log('💡 Running in Mock In-Memory DB Mode. No live MongoDB Atlas connection required.');
    process.env.USE_MOCK_DB = 'true';
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('💡 Falling back to Mock In-Memory DB Mode...');
    process.env.USE_MOCK_DB = 'true';
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });
};

export default connectDB;
