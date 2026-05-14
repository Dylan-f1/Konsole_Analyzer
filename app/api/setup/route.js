import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";

// Creates the first admin user — only works if no users exist yet
export async function POST(req) {
  await connectDB();

  const count = await User.countDocuments();
  if (count > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, role: "admin" });

  return NextResponse.json({ id: user._id.toString(), email: user.email, role: user.role }, { status: 201 });
}
