import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                rank: true,
              }
            }
          },
          orderBy: { joinedAt: "asc" }
        },
        host: {
          select: { id: true, username: true }
        },
        messages: {
          include: {
            user: {
              select: { username: true }
            }
          },
          orderBy: { createdAt: "asc" },
          take: 50
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get latest battle info
    const battle = await db.battle.findFirst({
      where: { roomId },
      orderBy: { startedAt: "desc" }
    });

    const activeThreshold = new Date(Date.now() - 30000); // 30 seconds

    // Map to frontend format
    const formattedRoom = {
      id: room.id,
      name: room.name,
      status: room.status,
      bpm: room.bpm === 0 ? "Any" : room.bpm,
      timerMinutes: room.timerMinutes,
      hostId: room.hostId,
      players: room.players.map(p => ({
        id: p.user.id,
        username: p.user.username,
        rank: p.user.rank,
        isReady: p.isReady,
        isHost: p.user.id === room.hostId,
        isOnline: p.lastHeartbeatAt > activeThreshold
      })),
      messages: room.messages.map(m => ({
        id: m.id,
        user: m.user.username,
        content: m.content,
        time: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      battle: battle ? {
        id: battle.id,
        status: battle.status,
        statusChangedAt: battle.statusChangedAt,
        startedAt: battle.startedAt
      } : null
    };

    return NextResponse.json(formattedRoom);
  } catch (error) {
    console.error("GET_ROOM_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const body = await req.json();
    const { name, bpm, timerMinutes, isPrivate, password } = body;

    // Check if user is host
    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { hostId: true }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostId !== session.user.id) {
      return NextResponse.json({ error: "Only the host can change settings" }, { status: 403 });
    }

    const updatedRoom = await db.room.update({
      where: { id: roomId },
      data: {
        name: name !== undefined ? name : undefined,
        bpm: bpm !== undefined ? (bpm === "Any" ? 0 : parseInt(bpm)) : undefined,
        timerMinutes: timerMinutes !== undefined ? parseInt(timerMinutes) : undefined,
        isPrivate: isPrivate !== undefined ? !!isPrivate : undefined,
        password: password !== undefined ? password : undefined,
      }
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("ROOM_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
