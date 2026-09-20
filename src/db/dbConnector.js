import mongoose from 'mongoose';

// this is how we gracefully handle database connection

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongoDB successfully connect');
  } catch (error) {
    console.error('mongoDB falied to connect', error);
    process.exit(1);
  }
};

export default connectDb;
