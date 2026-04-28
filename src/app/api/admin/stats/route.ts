import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    // @ts-ignore
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [userCount, roomCount, packCount, reportCount] = await Promise.all([
      db.user.count(),
      db.room.count(),
      db.samplePack.count(),
      db.report.count({ where: { resolved: false } }),
    ]);

    return NextResponse.json({
      users: userCount,
      rooms: roomCount,
      samples: packCount,
      reports: reportCount,
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
