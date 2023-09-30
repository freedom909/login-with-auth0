import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

function initMongoose() {
  const connectionUrl = process.env.MONGODB_URL;
  console.log(process.env.MONGODB_URL)
  mongoose.connect(connectionUrl);

  mongoose.connection.on("connected", () => {
    console.log(`Mongoose default connection ready at ${connectionUrl}`);
  });

  mongoose.connection.on("error", error => {
    console.log("Mongoose default connection error:", error);
  });
}

export default initMongoose;
