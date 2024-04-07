import mongoose from "mongoose";

const connectDB = async (MONGODB_URI: string) => {
  try {
    console.log("Connecting to the database....");
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to the database.");
  } catch (error: any) {
    console.log("Error connecting to the database.");
    console.log("Error:", error);
  }
};
export default connectDB;