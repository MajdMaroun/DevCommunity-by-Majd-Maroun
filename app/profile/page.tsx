import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/queries/users";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return <ProfileView user={user} isOwnProfile />;
}