import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  console.log("REGISTER: Start POST request");
  try {
    const body = await req.json();
    const { email, password, username } = body;
    console.log("REGISTER: Data received", { email, username });

    if (!email || !password || !username) {
      console.log("REGISTER: Missing fields");
      return NextResponse.json(
        { error: "Required data missing (email, username, password)" },
        { status: 400 }
      );
    }

    console.log("REGISTER: Checking existing user");
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      },
    });

    if (existingUser) {
      console.log("REGISTER: User exists");
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 }
      );
    }

    console.log("REGISTER: Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("REGISTER: Creating user in DB");
    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: username,
      },
    });

    console.log("REGISTER: Success", { userId: user.id });
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    });
  } catch (error: any) {
    console.error("REGISTRATION_ERROR_DETAIL:", error);
    return NextResponse.json(
      { error: "Internal error creating account: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
