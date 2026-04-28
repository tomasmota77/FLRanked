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

    const packs = await db.samplePack.findMany({
      where: {
        name: { contains: query },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error("ADMIN_SAMPLES_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
