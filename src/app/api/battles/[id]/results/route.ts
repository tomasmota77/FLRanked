import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: roomId } = await params;

    // 1. Get the current battle
    const battle = await db.battle.findFirst({
      where: { roomId },
      orderBy: { startedAt: "desc" },
    });

    if (!battle) {
      return NextResponse.json({ error: "No battle found" }, { status: 404 });
    }

    // 2. Fetch submissions with votes
    const submissions = await db.submission.findMany({
      where: { battleId: battle.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rank: true,
            elo: true,
          }
        },
        votes: true,
      },
    });

    // 3. Sort by votes
    const results = submissions
      .map((s) => ({
        id: s.id,
        userId: s.user.id,
        username: s.user.username,
        votes: s.votes.length,
        rank: s.user.rank,
        oldElo: s.user.elo,
        isYou: s.user.id === session?.user?.id,
        audioUrl: s.audioUrl,
      }))
      .sort((a, b) => b.votes - a.votes);

    // 4. Assign positions and calculate ELO changes (simplified)
    const finalResults = results.map((res, index) => {
      const position = index + 1;
      let eloChange = 0;
      
      if (position === 1) eloChange = 30 + Math.floor(Math.random() * 10);
      else if (position === 2) eloChange = 10 + Math.floor(Math.random() * 5);
      else if (position === 3) eloChange = -5 - Math.floor(Math.random() * 5);
      else eloChange = -15 - Math.floor(Math.random() * 5);

      return {
        ...res,
        position,
        eloChange,
        newElo: res.oldElo + eloChange,
      };
    });

    return NextResponse.json({
      battleId: battle.id,
      results: finalResults,
    });
  } catch (error: any) {
    console.error("FETCH_RESULTS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
