import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { elo: "desc" },
      take: 50,
      select: {
        id: true,
        username: true,
        elo: true,
        wins: true,
        losses: true,
        streak: true,
        rank: true,
        image: true,
      }
    });

    const players = users.map((u, i) => ({
      ...u,
      position: i + 1
    }));

    return NextResponse.json({ players });
  } catch (error) {
    console.error("LEADERBOARD_API_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
