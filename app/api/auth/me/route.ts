import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { auth } from "@/auth";

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
{
headers: {
"Cache-Control": "no-store",
},
}
);
}

export async function GET(request: NextRequest) {
await connection();

try {
await connectToDatabase();

let user: MeUser | null = null;

// 1. Check the NextAuth session first.
const session = await auth();
const id = session?.user?.id ?? null;

if (id) {
  user = (await User.findById(id)
    .select("-password")
    .lean()) as MeUser | null;
}

// 2. Fall back to the custom JWT cookie.
if (!user) {
  const token = request.cookies.get("token")?.value;

  if (token) {
    try {
      const secretValue = process.env.JWT_SECRET;

      if (!secretValue) {
        throw new Error("JWT_SECRET is not configured");
      }

      const secret = new TextEncoder().encode(secretValue);
      const { payload } = await jwtVerify(token, secret);

      if (typeof payload.userId === "string") {
        user = (await User.findById(payload.userId)
          .select("-password")
          .lean()) as MeUser | null;
      }
    } catch {
      // Invalid or expired custom JWT.
    }
  }
}

if (!user) {
  return NextResponse.json(
    { error: "Not authenticated" },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

return respond(user);

} catch (error) {
console.error("Auth check error:", error);

return NextResponse.json(
  { error: "Unable to verify session" },
  {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
    },
  }
);

}
}
