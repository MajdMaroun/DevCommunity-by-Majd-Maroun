import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getCurrentUserId } from "@/lib/queries/auth";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

type MeUser = {
  _id: unknown;
  name: string;
  username?: string;
  email?: string;
  image?: string | null;
  bio?: string;
  followers?: number;
  following?: number;
};

function respond(user: MeUser) {
  return NextResponse.json(
    {
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image ?? null,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    let user: MeUser | null = null;

    // 1. Same identity the rest of the app uses (Settings, joins, sidebar card).
    //    This must come first: an old "token" cookie from an earlier login can
    //    point at a different account and would otherwise win.
    const id = await getCurrentUserId();
    if (id) {
      user = (await User.findById(id)
        .select("-password")
        .lean()) as MeUser | null;
    }

    // 2. Fallback: custom JWT cookie login
    if (!user) {
      const token = request.cookies.get("token")?.value;
      if (token) {
        try {
          const { payload } = await jwtVerify(token, secret);
          user = (await User.findById(payload.userId)
            .select("-password")
            .lean()) as MeUser | null;
        } catch {
          // invalid or expired token
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return respond(user);
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 }
    );
  }
}