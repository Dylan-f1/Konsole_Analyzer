import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import Organization from "@/lib/models/Organization";

// Creates the first organization and admin user — only works if no users exist yet
export async function POST(req) {
  await connectDB();

  const count = await User.countDocuments();
  if (count > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const { name, email, password, orgName } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }

  // Create the organization first
  const slug = (orgName ?? email.split("@")[1] ?? "default")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  const org = await Organization.create({
    name: orgName ?? `Org ${email}`,
    slug: `${slug}-${Date.now()}`,
  });

  const hashed = await bcrypt.hash(password, 12);
  const user   = await User.create({
    name,
    email,
    password: hashed,
    role:         "admin",
    organization: org._id,
  });

  return NextResponse.json({
    id:           user._id.toString(),
    email:        user.email,
    role:         user.role,
    organization: { id: org._id.toString(), name: org.name },
  }, { status: 201 });
}
