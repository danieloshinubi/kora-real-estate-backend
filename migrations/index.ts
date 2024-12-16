import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);

    const connectOptions: mongoose.ConnectOptions = {
      // Add other options if needed, e.g., 'dbName' or 'autoIndex'
    };

    const connect = await mongoose.connect(
      process.env.DB_URL as string,
      connectOptions
    );

    console.log('MongoDB connected: ', connect.connection.host);
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
