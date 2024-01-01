import express from "express";
import { body } from "express-validator";
import userController from "../controllers/user.js";
import UserModel from "../models/user.js";

const router = express.Router();

// send link sign up
router.post('/', userController.sendLinkSignup);

// send link reset password
router.post('/reset', userController.sendLinkResetPassword);

// reset password
router.post('/reset/:token', userController.resetPassword);

// active link sign up and store data 
router.post('/:token', userController.signup);


export default router;