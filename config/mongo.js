import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const CONNECTION_URL =
  "mongodb://sodro:nguyenqb242@3.27.162.172:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.1";

mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongo has connected succesfully");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongo has reconnected");
});
mongoose.connection.on("error", (error) => {
  console.log("Mongo connection has an error", error);
  mongoose.disconnect();
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongo connection is disconnected");
});
