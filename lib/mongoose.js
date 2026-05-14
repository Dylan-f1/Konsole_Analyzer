import mongoose from "mongoose";

// Singleton — évite de créer une nouvelle connexion à chaque hot-reload en dev
let cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquante dans les variables d'environnement");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
