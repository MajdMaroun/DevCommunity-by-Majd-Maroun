import { notFound, redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser, getUserByUsername } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/post";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  // Visiting your own public URL sends you to your own profile page
  const me = await getCurrentUser();
  if (me && me._id === user._id) redirect("/profile");

  // Published posts only; other people's drafts stay private
  const posts = await getPostsByAuthor(user._id, false);

  return <ProfileView user={user} posts={posts} />;
}