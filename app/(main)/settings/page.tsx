import { Suspense } from "react";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/queries/users";

async function SettingsContent() {
const user = await getCurrentUser();

if (!user) {
redirect("/login");
}

return ( <div> <h1 className="text-2xl font-bold">Settings</h1>

  <p className="mb-8 mt-1 text-sm text-slate-400">
    Update how you appear to other developers.
  </p>

  <div className="rounded-xl border border-slate-800 bg-[#0f1629] p-6">
    <SettingsForm
      user={{
        name: user.name,
        username: user.username,
        bio: user.bio,
        title: user.title ?? "",
        image: user.image,
        email: user.email,
      }}
    />
  </div>
</div>

);
}

export default function SettingsPage() {
return (
<Suspense
fallback={ <div className="animate-pulse"> <div className="h-8 w-40 rounded bg-slate-800" /> <div className="mb-8 mt-3 h-4 w-64 rounded bg-slate-800" /> <div className="h-64 rounded-xl bg-slate-900" /> </div>
}
> <SettingsContent /> </Suspense>
);
}
