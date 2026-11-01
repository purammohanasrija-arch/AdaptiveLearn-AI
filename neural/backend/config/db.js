import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('ℹ️  No MONGO_URI specified. Operating in high-speed In-Memory / Demo Store mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed (${error.message}). Falling back gracefully to Demo Data Store.`);
    isMongoConnected = false;
    return false;
  }
};

export const getIsMongoConnected = () => isMongoConnected;
