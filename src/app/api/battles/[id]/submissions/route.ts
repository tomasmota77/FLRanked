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

    // 1. Get the current battle (could be IN_PROGRESS or VOTING)
    const battle = await db.battle.findFirst({
      where: { roomId },
      orderBy: { startedAt: "desc" },
    });

    if (!battle) {
      return NextResponse.json({ error: "No battle found" }, { status: 404 });
    }

    // 2. Fetch all submissions for this battle
    const submissions = await db.submission.findMany({
      where: { battleId: battle.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    // 3. Map to format for listening/voting
    const formattedSubmissions = submissions.map((s, index) => ({
      id: s.id,
      label: s.user.username,
      audioUrl: s.audioUrl,
      userId: s.user.id,
      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
    }));

    return NextResponse.json({
      battleId: battle.id,
      submissions: formattedSubmissions,
    });
  } catch (error: any) {
    console.error("FETCH_SUBMISSIONS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
