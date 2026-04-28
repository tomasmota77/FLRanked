import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "No submission specified" }, { status: 400 });
    }

    // 1. Get the current active battle for this room
    const battle = await db.battle.findFirst({
      where: { 
        roomId,
        status: { in: ["IN_PROGRESS", "VOTING"] }
      },
      orderBy: { startedAt: "desc" }
    });

    if (!battle) {
      return NextResponse.json({ error: "No active battle found" }, { status: 404 });
    }

    // 2. Verify submission exists and belongs to this battle
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.battleId !== battle.id) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    // 3. Prevent self-voting
    if (submission.userId === session.user.id) {
      return NextResponse.json({ error: "You cannot vote for your own beat" }, { status: 403 });
    }

    // 4. Record the vote (upsert to allow changing vote if needed, or create if strict)
    const vote = await db.vote.upsert({
      where: {
        voterId_battleId: {
          voterId: session.user.id,
          battleId: battle.id
        }
      },
      update: {
        submissionId,
        createdAt: new Date()
      },
      create: {
        voterId: session.user.id,
        battleId: battle.id,
        submissionId
      }
    });

    return NextResponse.json({
      success: true,
      voteId: vote.id,
      message: "Vote recorded successfully",
    });
  } catch (error: any) {
    console.error("VOTE_ERROR:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
