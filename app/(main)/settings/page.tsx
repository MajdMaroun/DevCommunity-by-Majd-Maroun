import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-white">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 mb-8 text-sm text-gray-400">
        Update your public profile information.
      </p>

      <SettingsForm user={user} />
    </div>
  );
}