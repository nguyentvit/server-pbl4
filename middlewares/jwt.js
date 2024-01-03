import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const decode = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "No access token provided",
    });
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(accessToken, SECRET_KEY);
    const user = await UserModel.findOne({
      _id: decoded._id,
      "tokens.token": accessToken,
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = accessToken;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this resource",
    });
  }
};
