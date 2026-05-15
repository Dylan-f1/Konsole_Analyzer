import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Analysis from "@/lib/models/Analysis";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const skip  = (page - 1) * limit;

  await connectDB();

  const [analyses, total] = await Promise.all([
    Analysis.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("analyzedBy", "name")
      .select("url companyName favicon sector companySize analyzedBy createdAt")
      .lean(),
    Analysis.countDocuments(),
  ]);

  return NextResponse.json({
    analyses: analyses.map((a) => ({ ...a, _id: a._id.toString() })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
