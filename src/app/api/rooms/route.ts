import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoomType } from "@prisma/client";

export async function GET() {
  try {
    const now = new Date();
    const roomTimeout = new Date(now.getTime() - 60 * 1000); // 1 minute
    const playerTimeout = new Date(now.getTime() - 30 * 1000); // 30 seconds
    const newRoomGracePeriod = new Date(now.getTime() - 60 * 1000); // 1 minute

    // 1. Cleanup inactive players
    const inactivePlayers = await db.roomPlayer.deleteMany({
      where: {
        lastHeartbeatAt: { lt: playerTimeout },
      },
    });
    if (inactivePlayers.count > 0) console.log(`[Cleanup] Deleted ${inactivePlayers.count} inactive players`);

    // 2. Cleanup rooms with no players (only if they aren't brand new)
    const roomsToDelete = await db.room.findMany({
      where: {
        players: { none: {} },
        createdAt: { lt: newRoomGracePeriod },
      },
      select: { id: true, name: true }
    });

    if (roomsToDelete.length > 0) {
      console.log(`[Cleanup] Deleting ${roomsToDelete.length} empty rooms:`, roomsToDelete.map(r => r.name));
      await db.room.deleteMany({
        where: {
          id: { in: roomsToDelete.map((r) => r.id) },
        },
      });
    }

    // 3. Cleanup timed out rooms
    const timedOutRooms = await db.room.deleteMany({
      where: {
        lastHeartbeatAt: { lt: roomTimeout },
      },
    });
    if (timedOutRooms.count > 0) console.log(`[Cleanup] Deleted ${timedOutRooms.count} timed out rooms`);

    // 3. Fetch active rooms
    const rooms = await db.room.findMany({
      include: {
        host: {
          select: { username: true }
        },
        _count: {
          select: { players: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Map to frontend format
    const formattedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      maxPlayers: room.maxPlayers,
      currentPlayers: room._count.players,
      status: room.status,
      bpm: room.bpm === 0 ? "Any" : room.bpm,
      genre: room.genre,
      host: room.host.username,
      isPrivate: room.isPrivate,
      difficulty: "Beginner", // Defaulting for now
      timeLeft: room.status === "IN_PROGRESS" ? "10:00" : null,
    }));

    return NextResponse.json(formattedRooms);
  } catch (error) {
    console.error("FETCH_ROOMS_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, bpm, timerMinutes, isPrivate, password } = await req.json();

    let maxPlayers = 4;
    let roomType: RoomType = RoomType.FOUR_PLAYERS;

    if (type === "1v1") {
      maxPlayers = 2;
      roomType = RoomType.ONE_V_ONE;
    } else if (type === "8 Players") {
      maxPlayers = 8;
      roomType = RoomType.EIGHT_PLAYERS;
    } else if (type === "16 Players") {
      maxPlayers = 16;
      roomType = RoomType.SIXTEEN_PLAYERS;
    }

    const room = await db.room.create({
      data: {
        name: name || "New Battle Room",
        type: roomType,
        maxPlayers: maxPlayers,
        bpm: bpm === "Any" ? 0 : (parseInt(bpm) || 140),
        timerMinutes: parseInt(timerMinutes) || 10,
        isPrivate: !!isPrivate,
        password: password || null,
        hostId: session.user.id,
        lastHeartbeatAt: new Date(),
      }
    });

    // Automatically join the host
    await db.roomPlayer.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        isReady: true,
        lastHeartbeatAt: new Date(),
      }
    });

    return NextResponse.json(room);
  } catch (error: any) {
    console.error("ROOM_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to create room", details: error.message },
      { status: 500 }
    );
  }
}
