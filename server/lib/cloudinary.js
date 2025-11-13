import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Get environment variables
const env = process.env;
const cloud_name = env.CLOUDINARY_CLOUD_NAME;
const api_key = env.CLOUDINARY_API_KEY;
const api_secret = env.CLOUDINARY_API_SECRET;

const CLOUDINARY_CONFIG = {
  cloud_name,
  api_key,
  api_secret,
};

const missingKeys = Object.entries(CLOUDINARY_CONFIG)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isCloudinaryConfigured = missingKeys.length === 0;

if (missingKeys.length) {
  const message = `[cloudinary] Missing credentials: ${missingKeys.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${message}. Image uploads will fail until environment variables are set.`
    );
  } else {
    console.warn(
      `${message}. Image uploads will fail until environment variables are set.`
    );
  }
} else {
  cloudinary.config(CLOUDINARY_CONFIG);
  console.log("[cloudinary] Successfully configured ✅");
}

export const getCloudinaryInstance = () => {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not properly configured.");
  }
  return cloudinary;
};

export default cloudinary;
