import { db } from "../src/lib/db";

async function check() {
    const user = await db.user.findFirst();
    if (!user) {
      console.log("No user found to simulate room creation");
      return;
    }

    console.log("Simulating room creation for user:", user.username);
    
    const room = await db.room.create({
      data: {
        name: "Test Room " + Date.now(),
        type: "FOUR_PLAYERS",
        maxPlayers: 4,
        bpm: 140,
        timerMinutes: 10,
        isPrivate: false,
        hostId: user.id,
        lastHeartbeatAt: new Date(),
      }
    });
    console.log("Room created:", room.id);

    await db.roomPlayer.create({
      data: {
        roomId: room.id,
        userId: user.id,
        isReady: true,
        lastHeartbeatAt: new Date(),
      }
    });
    console.log("Player joined room");
  } catch (err) {
    console.error("DB Check failed:", err);
  }
}

check();
