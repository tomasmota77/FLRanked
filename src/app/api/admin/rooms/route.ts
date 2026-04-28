import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const rooms = await db.room.findMany({
      where: {
        name: { contains: query },
      },
      include: {
        host: {
          select: { username: true }
        },
        _count: {
          select: { players: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("ADMIN_ROOMS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
