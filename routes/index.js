import express from "express";

import userController from "../controllers/user.js";

import { decode } from "../middlewares/jwt.js"

const router = express.Router();

// login
router.post('/login', userController.login);

// get profile
router.get('/users/me', decode, userController.getProfile);

//logout
router.post('/users/me/logout', decode, userController.logout);

//logout all
router.post('/users/me/logoutall', decode, userController.logoutall);

//find 
router.get('/users/find/:userId', decode, userController.findUserById);

//find all
router.get('/users/find', decode, userController.getAllUsers);

export default router;

