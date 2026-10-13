import { notFound, redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser, getUserByUsername } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/post";
import { getRelationship } from "@/lib/queries/follow";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;

  // Next.js hands over the URL-encoded value ("lichaa%20mar"), so decode it before the lookup
  let username = rawUsername;
  try {
    username = decodeURIComponent(rawUsername);
  } catch {
    // keep the raw value if it is not valid encoding
  }

  const user = await getUserByUsername(username);
  if (!user) notFound();

  // Visiting your own public URL sends you to your own profile page
  const me = await getCurrentUser();
  if (me && me._id === user._id) redirect("/profile");

  // Published posts only; other people's drafts stay private
  const posts = await getPostsByAuthor(user._id, false);

  // Real follow state from the database, so it survives a refresh
  const relationship = await getRelationship(me?._id ?? null, user._id);

  return <ProfileView user={user} posts={posts} relationship={relationship} />;
}