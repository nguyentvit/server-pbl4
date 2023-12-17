import validator from "validator";
import bcypt from "bcryptjs";
import mongoose from "mongoose";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const USER_TYPES = {
    CONSUMER: "consumer",
    SUPPORT: "support"
}

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => v4().replace(/\-/g, "")
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: value => {
                if (!validator.isEmail(value)) {
                    throw new Error({
                        error: 'Invalid Email address'
                    })
                }
            }

        },
        password: {
            type: String,
            required: true,
            minLength: 7
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            default: 'images/defaultImgAvatar.png'
        },
        type: {
            type: String,
            requied: true,
            default: () => USER_TYPES.CONSUMER
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
    },
    {
        timestamps: true,
        collection: "users"
    }
)

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcypt.hash(user.password, 8);
    }
    next();
})

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({
        _id: user._id,
        type: user.type
    }, process.env.SECRET_KEY, {expiresIn: '24h'})
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async function(email, password) {
    try {
        const user = await this.findOne({ email })
        if (!user) {
            throw new Error({
                error: 'Invalid login credentials'
            })
        }
        const isPasswordMatch = await bcypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error({
                error: 'Invalid login credentials'
            })
        }
        return user;
    } catch (error) {
        throw error;
    }
}

userSchema.statics.createUser = async function(email, password, name) {
    try {
        const user = await this.create({
            email,
            password,
            name
        })
        return user;
    } catch (error) {
        throw error;
    }
}

userSchema.statics.getUserById = async function(id) {
    try {
        const user = await this.findOne({ _id: id});
        if (!user) throw ({
            error: 'No user with this id found'
        })
        return user;
    } catch (error) {
        throw error;
    }
}

userSchema.statics.getUserByIds = async function (ids) {
    try {
        const users = await this.find({ _id: { $in: ids }});
        return users;
    } catch (error) {
        throw error;
    }
}



export default mongoose.model("User", userSchema);