import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    // Calculate level and XP progress
    const level = Math.floor(user.xp / 500) + 1;
    const xpForCurrentLevel = (level - 1) * 500;
    const xpForNextLevel = level * 500;
    const xpProgress = Math.round(
      ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
    );

    return NextResponse.json({
      ...user,
      level,
      xpProgress,
    });
  } catch (error: any) {
    console.error("USER_ME_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
