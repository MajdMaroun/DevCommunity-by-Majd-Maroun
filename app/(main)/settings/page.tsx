// app/(main)/settings/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const settings = JSON.parse(JSON.stringify(user.settings ?? {}));

  return (
    <SettingsForm
      user={{
        name: user.name,
        username: user.username,
        settings,
      }}
    />
  );
}