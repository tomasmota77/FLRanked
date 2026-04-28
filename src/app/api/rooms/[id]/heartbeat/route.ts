import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Update player heartbeat (use updateMany to avoid error if player is gone)
    await db.roomPlayer.updateMany({
      where: { roomId: id, userId: session.user.id },
      data: { lastHeartbeatAt: new Date() },
    });

    // Update room heartbeat
    await db.room.update({
      where: { id },
      data: { lastHeartbeatAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("HEARTBEAT_ERROR:", error);
    return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 });
  }
}
