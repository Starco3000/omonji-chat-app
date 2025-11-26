import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    //@ts-ignore
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('Connect Database Successfully!');
  } catch (error) {
    console.log('Failed when connect to database', error);
    process.exit(1); //Exit process with failue
  }
};
