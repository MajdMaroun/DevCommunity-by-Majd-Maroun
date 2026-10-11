import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Community from "@/lib/models/Community";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

// Treat the search text literally, so "c++" or "(" can't break the query
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 50);

  if (q.length < 2) {
    return NextResponse.json({ communities: [], posts: [], people: [] });
  }

  try {
    await connectToDatabase();
    const rx = new RegExp(escapeRegex(q), "i");

    const [communities, posts, people] = await Promise.all([
      Community.find({
        $or: [{ name: rx }, { description: rx }, { topics: rx }],
      })
        .select("name slug logo")
        .limit(5)
        .lean(),

      Post.find({
        published: true,
        $or: [{ title: rx }, { topics: rx }],
      })
        .select("title slug")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Only users with a username, since that is what their profile URL uses.
      // No email, password or photo is selected.
      User.find({
        username: { $exists: true, $ne: null },
        $or: [{ name: rx }, { username: rx }],
      })
        .select("name username")
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json(
      {
        communities: communities.map((c) => ({
          id: String(c._id),
          name: c.name,
          slug: c.slug,
          logo: c.logo ?? null,
        })),
        posts: posts.map((p) => ({
          id: String(p._id),
          title: p.title,
          slug: p.slug,
        })),
        people: people.map((u) => ({
          id: String(u._id),
          name: u.name,
          username: u.username,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { communities: [], posts: [], people: [] },
      { status: 500 }
    );
  }
}