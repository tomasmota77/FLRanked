import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Verify user is in the room
    const player = await db.roomPlayer.findUnique({
      where: { roomId_userId: { roomId: id, userId: session.user.id } },
    });

    if (!player) {
      return NextResponse.json({ error: "You are not in this room" }, { status: 403 });
    }

    const message = await db.message.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        roomId: id,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    return NextResponse.json({
      id: message.id,
      user: message.user.username,
      content: message.content,
      time: message.createdAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch (error: any) {
    console.error("SEND_MESSAGE_ERROR:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
