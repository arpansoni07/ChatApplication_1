import jwt from "jsonwebtoken";
import User from "../middleWare/models/User.js";

// ---Function to generate a token for a use -----

export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return token;
};
