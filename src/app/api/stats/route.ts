import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Live Battles (InProgress or Voting)
    const liveBattles = await db.battle.count({
      where: {
        status: { in: ["IN_PROGRESS", "VOTING"] }
      }
    });

    // 2. Producers Online (Users with recent heartbeat in a room)
    const producersOnline = await db.roomPlayer.count({
      where: {
        lastHeartbeatAt: { gte: thirtySecondsAgo }
      }
    });

    // 3. Active Producers (Total Users)
    const activeProducers = await db.user.count();

    // 4. Battles Today (Created in last 24h)
    const battlesToday = await db.battle.count({
      where: {
        startedAt: { gte: twentyFourHoursAgo }
      }
    });

    // 5. Beats Created (Total Submissions)
    const beatsCreated = await db.submission.count();

    return NextResponse.json({
      liveBattles,
      producersOnline,
      activeProducers,
      battlesToday,
      beatsCreated
    });
  } catch (error) {
    console.error("STATS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
