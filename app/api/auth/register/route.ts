import { NextRequest, NextResponse } from "next/server";

import {connectToDatabase} from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}