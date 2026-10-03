import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token) as {
      id: string;
    };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid token",
      },
      {
        status: 401,
      }
    );
  }
}