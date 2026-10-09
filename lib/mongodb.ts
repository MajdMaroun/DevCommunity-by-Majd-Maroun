import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  await mongoose.connect(MONGODB_URI, {
   // here you can add any additional options for the connection if needed
   // like useNewUrlParser, useUnifiedTopology, etc. but they are not necessary in Mongoose 6 and above
    });
}