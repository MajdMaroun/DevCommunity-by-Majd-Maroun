import { notFound, redirect } from "next/navigation";
import { getUser, getCurrentUser } from "@/lib/queries/users";
import ProfileView from "@/components/ProfileView";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [user, currentUser] = await Promise.all([
    getUser(username),
    getCurrentUser(),
  ]);

  if (!user) notFound();

  // Visiting your own username URL goes to /profile
  if (currentUser?.username === user.username) redirect("/profile");

  return <ProfileView user={user} />;
}