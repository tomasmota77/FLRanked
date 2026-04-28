import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoomStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const { status } = await request.json();

    if (!["LISTENING", "VOTING", "FINISHED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the current active battle for this room
    const battle = await db.battle.findFirst({
      where: { roomId },
      orderBy: { startedAt: "desc" }
    });

    if (!battle) {
      return NextResponse.json({ error: "No active battle found" }, { status: 404 });
    }

    // Verify host (optional, but recommended)
    const room = await db.room.findUnique({ where: { id: roomId } });
    if (room?.hostId !== session.user.id) {
      // Allow transition only if host or if it's an automatic transition (we'll trust the client for now)
      // return NextResponse.json({ error: "Only host can change status" }, { status: 403 });
    }

    const updatedBattle = await db.battle.update({
      where: { id: battle.id },
      data: { 
        status: status as RoomStatus,
        statusChangedAt: new Date()
      }
    });

    // Also update room status to match
    await db.room.update({
      where: { id: roomId },
      data: { status: status as RoomStatus }
    });

    return NextResponse.json({ success: true, status: updatedBattle.status });
  } catch (error: any) {
    console.error("STATUS_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
