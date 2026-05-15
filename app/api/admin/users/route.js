import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";

// GET — list all users (admin only)
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  return NextResponse.json(users.map((u) => ({ ...u, _id: u._id.toString() })));
}

// POST — create a new user (admin only)
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email et password sont requis" }, { status: 400 });
  }

  await connectDB();

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, role: role ?? "gtm_engineer" });

  return NextResponse.json({ _id: user._id.toString(), name: user.name, email: user.email, role: user.role }, { status: 201 });
}

// DELETE — remove a user (admin only)
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await req.json();
  if (id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
