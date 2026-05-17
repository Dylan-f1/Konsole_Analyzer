import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Watch from "@/lib/models/Watch";

// GET — check if the current user is watching a URL
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const url   = new URL(req.url).searchParams.get("url");
  const orgId = session.user.organizationId;
  if (!url) return NextResponse.json({ watching: false });

  await connectDB();
  const watch = await Watch.findOne({ organization: orgId, url, watchedBy: session.user.id });
  return NextResponse.json({ watching: !!watch });
}

// POST — start watching a URL
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { url, companyName, favicon, snapshot } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

  const orgId = session.user.organizationId;
  await connectDB();

  await Watch.findOneAndUpdate(
    { organization: orgId, url },
    {
      $set:      { companyName, favicon, lastSnapshot: snapshot, organization: orgId },
      $addToSet: { watchedBy: session.user.id },
    },
    { upsert: true }
  );

  return NextResponse.json({ watching: true });
}

// DELETE — stop watching a URL
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { url } = await req.json();
  const orgId   = session.user.organizationId;
  await connectDB();

  await Watch.findOneAndUpdate(
    { organization: orgId, url },
    { $pull: { watchedBy: session.user.id } }
  );

  // Clean up watches with no watchers left
  await Watch.deleteMany({ organization: orgId, watchedBy: { $size: 0 } });

  return NextResponse.json({ watching: false });
}
