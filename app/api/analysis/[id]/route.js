import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Analysis from "@/lib/models/Analysis";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const analysis = await Analysis.findById(params.id).lean();

    if (!analysis) {
      return NextResponse.json({ error: "Analyse introuvable" }, { status: 404 });
    }

    return NextResponse.json({ ...analysis, _id: analysis._id.toString() });
  } catch {
    return NextResponse.json({ error: "ID invalide ou erreur serveur" }, { status: 500 });
  }
}
