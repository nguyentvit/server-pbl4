import https from "https";
import http from "http";
import path, { dirname } from "path";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import { Server } from "socket.io";
import logger from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import cors from "cors";
import socket from "./utils/socket.js";
import fs from 'fs';
dotenv.config();
// mongo connection
import "./config/mongo.js";

// socket configuration
import WebSockets from "./utils/WebSocket.js";
// routes
import userRouter from './routes/user.js';
import indexRouter from "./routes/index.js";
import chatRoomRouter from "./routes/chatRoom.js";


const app = express();

const port = process.env.PORT || "3000";
const host = process.env.LOCAL_HOST || "localhost";
app.set("port", port);

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }   
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

//app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})
const file = fs.readFileSync('./9E1C6B252EA33AE887853073281262C5.txt');
// app.use("/", indexRouter);
// app.use("/users", userRouter);
// app.use("/room", chatRoomRouter);


app.get('/api', (req, res) => {
    res.send({
        kityt: "helo"
    })
})
app.get('/.well-known/pki-validation/9E1C6B252EA33AE887853073281262C5.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '9E1C6B252EA33AE887853073281262C5.txt'));
})

// catch 404 and forward to error handler
app.use('*', (req, res) => {
    return res.status(404).json({
        success: false,
        message: 'API endpoint doesnt exist'
    })
})

// Create HTTP server
const server = http.createServer(app);
const socketio = socket.init(server);
// Create socket connection
global.io = socketio.listen(server);
global.io.on('connection', WebSockets.connection);
// listen on provided port, on all network interfaces
server.listen(port);
// event listener for http server "listening" event
server.on("listening", () => {
    console.log(`Listening on port:: https://localhost:${port}`);
})
