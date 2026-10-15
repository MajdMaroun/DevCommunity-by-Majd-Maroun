// app/settings/page.tsx
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mb-8 mt-1 text-sm text-slate-400">
        Update how you appear to other developers.
      </p>

      <div className="rounded-xl border border-slate-800 bg-[#0f1629] p-6">
        <SettingsForm
          user={{
            name: user.name,
            username: user.username,
            bio: user.bio,
            image: user.image,
            email: user.email,
          }}
        />
      </div>
    </div>
  );
}