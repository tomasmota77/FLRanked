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

    // Delete the player from the room (using deleteMany to avoid error if already deleted)
    await db.roomPlayer.deleteMany({
      where: { roomId: id, userId: session.user.id },
    });

    // Check if there are any players left
    const remainingPlayers = await db.roomPlayer.count({
      where: { roomId: id },
    });

    // If no players left, we just let the heartbeat cleanup handle deleting the room later.
    // We only need to reassign host if there are players left.
    if (remainingPlayers > 0) {
      // If the host left, assign a new host
      const room = await db.room.findUnique({ where: { id } });
      if (room && room.hostId === session.user.id) {
        const nextPlayer = await db.roomPlayer.findFirst({
          where: { roomId: id },
          orderBy: { joinedAt: "asc" },
        });
        if (nextPlayer) {
          await db.room.update({
            where: { id },
            data: { hostId: nextPlayer.userId },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LEAVE_ROOM_ERROR:", error);
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 });
  }
}
