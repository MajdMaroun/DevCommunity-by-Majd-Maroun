import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Follow from "@/lib/models/Follow";
import { getRelationships } from "@/lib/queries/follow";

export const dynamic = "force-dynamic";

type Person = {
  _id: unknown;
  name: string;
  username?: string;
  title?: string;
  image?: string | null;
  bio?: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;

    let username = rawUsername;
    try {
      username = decodeURIComponent(rawUsername);
    } catch {
      // keep the raw value if it is not valid encoding
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type !== "followers" && type !== "following") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      username: username.toLowerCase(),
    }).select("_id name username title image bio");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const filter =
      type === "followers" ? { following: user._id } : { follower: user._id };

    const follows = await Follow.find(filter)
      .populate(
        type === "followers" ? "follower" : "following",
        "name username title image bio"
      )
      .lean();

    // Skip rows whose user was deleted (populate returns null for them)
    const people = follows
      .map((follow) =>
        (type === "followers" ? follow.follower : follow.following) as
          unknown as Person
          | null
      )
      .filter((p): p is Person => !!p && typeof p === "object" && "_id" in p);

    // The signed-in viewer's relationship to everyone in this list
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const rel = await getRelationships(
      viewerId,
      people.map((p) => String(p._id))
    );

    const result = people.map((p) => {
      const id = String(p._id);
      return {
        _id: id,
        name: p.name,
        username: p.username,
        title: p.title,
        image: p.image ?? null,
        bio: p.bio,
        iFollow: rel[id]?.iFollow ?? false, // I follow them
        followedBy: rel[id]?.followedBy ?? false, // they follow me
        isMe: id === viewerId, // hide the button on my own row
      };
    });

    return NextResponse.json(
      { people: result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Connections error:", error);

    return NextResponse.json(
      { error: "Failed to load connections" },
      { status: 500 }
    );
  }
}