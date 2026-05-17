import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Signal from "@/lib/models/Signal";

// GET — list signals for the current organization, with unread count
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const orgId = session.user.organizationId;
  await connectDB();

  const signals = await Signal.find({ organization: orgId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const userId = session.user.id;
  const result = signals.map((s) => ({
    ...s,
    _id:    s._id.toString(),
    unread: !s.seenBy?.map(String).includes(userId),
  }));

  const unreadCount = result.filter((s) => s.unread).length;

  return NextResponse.json({ signals: result, unreadCount });
}

// PATCH — mark all signals as seen for the current user
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const orgId = session.user.organizationId;
  await connectDB();

  await Signal.updateMany(
    { organization: orgId, seenBy: { $ne: session.user.id } },
    { $addToSet: { seenBy: session.user.id } }
  );

  return NextResponse.json({ success: true });
}
