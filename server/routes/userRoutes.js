import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
  logoutUser,
} from "../controllers/userController.js";
// import { protectRoute } from "../middleWare/Auth.js";
import { protectRoute } from "../middleWare/Auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", protectRoute, logoutUser);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
