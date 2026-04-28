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
    const { isReady } = await req.json();

    await db.roomPlayer.update({
      where: { roomId_userId: { roomId: id, userId: session.user.id } },
      data: { isReady: !!isReady },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("READY_ERROR:", error);
    return NextResponse.json({ error: "Failed to update ready state" }, { status: 500 });
  }
}
