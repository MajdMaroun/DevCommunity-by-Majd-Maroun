import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/post";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

const posts = await getPostsByAuthor(user._id, true);

return <ProfileView user={user} posts={posts} isOwnProfile />;
}