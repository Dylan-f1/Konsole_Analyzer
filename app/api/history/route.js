import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Analysis from "@/lib/models/Analysis";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id url companyName favicon score scoreLabel status sector companySize createdAt")
        .lean(),
      Analysis.countDocuments(),
    ]);

    return NextResponse.json({
      analyses: analyses.map((a) => ({ ...a, _id: a._id.toString() })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
