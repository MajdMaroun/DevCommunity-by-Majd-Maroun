import mongoose from "mongoose";

// Reuse the same MongoDB connection across requests and hot reloads.
const uri = process.env.MONGODB_URI;

// Store the connection and pending connection promise globally.
// This prevents creating unnecessary connections during development.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached =
  global._mongoose ??
  (global._mongoose = {
    conn: null,
    promise: null,
  });

export async function connectToDatabase() {
  // Fail immediately with a clear message if the environment variable is missing.
  if (!uri) {
    throw new Error("MONGODB_URI is missing from your environment variables.");
  }

  // Return the existing connection instead of opening another one.
  if (cached.conn) {
    return cached.conn;
  }

  // Create one connection promise and share it between concurrent requests.
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      // The default pool is 100. On Vercel, many copies of the app can run at once,
      // and a small pool keeps them under Atlas's free-tier connection limit.
      maxPoolSize: 5,
      // Fail fast with an error instead of hanging for 30 seconds if Atlas cannot be reached.
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Clear the failed promise so a later request can try connecting again.
    cached.promise = null;
    throw error;
  }
}