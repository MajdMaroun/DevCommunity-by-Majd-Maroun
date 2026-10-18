import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/post";

async function ProfileContent() {
const user = await getCurrentUser();

if (!user) {
redirect("/login");
}

const posts = await getPostsByAuthor(user._id, true);

return <ProfileView user={user} posts={posts} isOwnProfile />;
}

export default function ProfilePage() {
return (
<Suspense
fallback={ <div className="animate-pulse text-white"> <div className="h-32 rounded-xl bg-slate-900" /> <div className="mt-6 h-8 w-48 rounded bg-slate-800" /> <div className="mt-4 h-40 rounded-xl bg-slate-900" /> </div>
}
> <ProfileContent /> </Suspense>
);
}
