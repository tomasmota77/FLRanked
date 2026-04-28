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

    // Check room exists and is joinable
    const room = await db.room.findUnique({
      where: { id },
      include: { _count: { select: { players: true } } },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "WAITING") {
      return NextResponse.json({ error: "Room is not accepting players" }, { status: 400 });
    }

    // Cleanup inactive players before checking count (1 minute threshold)
    const inactiveThreshold = new Date(Date.now() - 60000);
    await db.roomPlayer.deleteMany({
      where: {
        roomId: id,
        lastHeartbeatAt: { lt: inactiveThreshold }
      }
    });

    // Re-fetch room with accurate count
    const updatedRoom = await db.room.findUnique({
      where: { id },
      include: { _count: { select: { players: true } } },
    });

    if (updatedRoom && updatedRoom._count.players >= updatedRoom.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // Join (upsert so it's idempotent — calling join twice doesn't error)
    await db.roomPlayer.upsert({
      where: { roomId_userId: { roomId: id, userId: session.user.id } },
      create: { 
        roomId: id, 
        userId: session.user.id, 
        isReady: false,
        lastHeartbeatAt: new Date()
      },
      update: {
        lastHeartbeatAt: new Date()
      },
    });

    // Also update room heartbeat
    await db.room.update({
      where: { id },
      data: { lastHeartbeatAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("JOIN_ROOM_ERROR:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
