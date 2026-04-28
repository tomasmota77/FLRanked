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
    const { audioUrl, fileName } = await request.json();

    if (!audioUrl || !fileName) {
      return NextResponse.json({ error: "Missing submission data" }, { status: 400 });
    }

    // 1. Get the current active battle for this room
    const battle = await db.battle.findFirst({
      where: { 
        roomId,
        status: "IN_PROGRESS"
      },
      orderBy: { startedAt: "desc" }
    });

    if (!battle) {
      return NextResponse.json({ error: "No active battle found" }, { status: 404 });
    }

    // 2. Save or update the submission
    const submission = await db.submission.upsert({
      where: {
        userId_battleId: {
          userId: session.user.id,
          battleId: battle.id
        }
      },
      update: {
        audioUrl,
        fileName,
        createdAt: new Date()
      },
      create: {
        userId: session.user.id,
        battleId: battle.id,
        audioUrl,
        fileName
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: "Beat submitted successfully",
    });
  } catch (error: any) {
    console.error("SUBMIT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to submit beat", details: error.message },
      { status: 500 }
    );
  }
}
