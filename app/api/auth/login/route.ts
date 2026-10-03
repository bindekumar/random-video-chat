import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {connectToDatabase} from "@/lib/db";
import User from "@/models/User";


export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}