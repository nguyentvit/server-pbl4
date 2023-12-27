import UserModel, { USER_TYPES } from '../models/user.js';
import makeValidation from '@withvoid/make-validation';
import { sendVerificationMail } from "../utils/sendVerificationMail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

export default 
{
    sendLinkSignup: async (req, res, next) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    name: { type: types.string },
                    email: { 
                        type: types.string,
                        checks: [
                            { rule: value => isValidEmail(value),
                              message: 'Invalid email format'
                            }
                        ]
                    },
                    password: {
                        type: types.string,
                        checks: [
                            {
                                rule: value => value.length >= 7,
                                message: 'Password must be at least 7 characters long'
                            }
                        ]
                    }
                }
            }))
            if (!validation.success) return res.status(400).json({
                message: 'Error'
            });

    
            const { email, password, name } = req.body;

            const user = await UserModel.findOne({email});
            if(user) return res.status(400).json({message:"User with the given email already exist"});
            const token = jwt.sign(
                {name, email, password},
                process.env.SECRET_KEY,
                {expiresIn: '20m'}
            );
            sendVerificationMail(res, email, token, 'users');
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            })
        }
        
    },
    signup : async (req, res, next) => {
        const token = req.params.token;
        let decodedToken;
        try {
            if (token) {
                decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            }
        } catch (error) {
            error.statusCode = 500;
            throw error;
        }
        if (!decodedToken) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const { email, name, password } = decodedToken;
        const userCheck = await UserModel.find({email: email});
        if (userCheck.length > 0) {
            return res.status(401).json({
                success: false,
                message: 'User was existed'
            })
        }
        try {
            const user = await UserModel.createUser(email, password, name);
            return res.status(200).json({
                success: true,
                user
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findByCredentials(email, password);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Login failed! Check authentication credentials'
                })
            }
            const token = await user.generateAuthToken();
            return res.status(200).json({
                success: true,
                user,
                token
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            })
        }
    },
    getProfile: async (req, res) => {
        const user = req.user;
        return res.status(200).json({
            success: true,
            user: user
        })
    },
    logout: async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token != req.token;
            })
            await req.user.save();
            return res.status(200).json({
                success: true,
                message: 'Log out success'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    logoutall: async (req, res) => {
        try {
            req.user.tokens.splice(0, req.user.tokens.length);
            await req.user.save();
            return res.status(200).json({
                success: true,
                message: 'Log out all success'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    sendLinkResetPassword: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    email: { 
                        type: types.string,
                        checks: [
                            { rule: value => isValidEmail(value),
                              message: 'Invalid email format'
                            }
                        ]
                    }
                }
            }))
            if (!validation.success) return res.status(400).json(validation);
            const { email } = req.body;
            const user = await UserModel.findOne({email});
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account with that email found'
                })
            }
            const token = jwt.sign(
                {email},
                process.env.SECRET_KEY,
                {expiresIn: '20m'}
            );
            sendVerificationMail(res, email, token, 'users/reset');

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    resetPassword: async (req, res) => {
        const token = req.params.token;
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            error.statusCode = 500;
            throw error;
        }
        if (!decodedToken) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const { email } = decodedToken;
        const newPassword = req.body.password;  
        try {
            const user = await UserModel.findOne({email});
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                })
            }
            user.password = newPassword;
            await user.save();
            return res.status(200).json({
                success: true,
                user
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    findUserById: async (req, res) => {
        const userId = req.params.userId;
        const user = await UserModel.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Not be found user'
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    },
    getAllUsers: async (req, res) => {
        const users = await UserModel.find({});
        if (!users) {
            return res.status(404).json({
                success: false,
                message: 'Not be found user'
            })
        };
        return res.status(200).json({
            success: true,
            users
        })
    }
}


