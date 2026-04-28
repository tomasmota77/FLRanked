import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = await params;

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        elo: true,
        xp: true,
        wins: true,
        losses: true,
        streak: true,
        bestStreak: true,
        rank: true,
        bio: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const level = Math.floor(user.xp / 500) + 1;
    const totalBattles = user.wins + user.losses;

    return NextResponse.json({
      ...user,
      level,
      totalBattles,
      joinedAt: user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
  } catch (error: any) {
    console.error("USER_PROFILE_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
