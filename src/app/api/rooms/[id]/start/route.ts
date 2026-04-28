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

    // Verify the caller is the host
    const room = await db.room.findUnique({ where: { id } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    if (room.hostId !== session.user.id) {
      return NextResponse.json({ error: "Only the host can start the battle" }, { status: 403 });
    }

    // 1. Change room status to IN_PROGRESS
    await db.room.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });

    // 2. Create a new Battle record
    const battle = await db.battle.create({
      data: {
        roomId: id,
        bpm: room.bpm,
        genre: room.genre,
        timerMinutes: room.timerMinutes,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, battleId: battle.id });
  } catch (error: any) {
    console.error("START_BATTLE_ERROR:", error);
    return NextResponse.json({ error: "Failed to start battle" }, { status: 500 });
  }
}
