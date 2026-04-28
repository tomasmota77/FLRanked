import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, bio, image } = body;

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json({ error: "Username too short" }, { status: 400 });
      }
      
      // Check if username is taken by someone else
      const existingUser = await db.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(image && { image }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
        bio: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
