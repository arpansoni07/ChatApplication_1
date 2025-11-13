
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log("mongoURI",">>>>>>>>>>>>>>>>>>>");
    console.log(process.env.MONGODB_URI,"??");

    if (!mongoURI) {
      throw new Error("❌ MONGODB_URI not found in .env file");
    }

    await mongoose.connect(mongoURI);

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB Connected Successfully");
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
