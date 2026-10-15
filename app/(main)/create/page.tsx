import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getCommunityOptions } from "@/lib/queries/post";
import CreatePostForm from "@/components/CreatePostForm";

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const communities = await getCommunityOptions();

  return (
    <div className="mx-auto max-w-2xl text-white">
      <h1 className="text-2xl font-bold">Create post</h1>
      <p className="mt-1 mb-8 text-sm text-gray-400">
        Share something with a community.
      </p>

      {communities.length === 0 ? (
        <p className="text-sm text-gray-400">
          No communities exist yet. Create one first so you can post in it.
        </p>
      ) : (
        <CreatePostForm communities={communities} />
      )}
    </div>
  );
}