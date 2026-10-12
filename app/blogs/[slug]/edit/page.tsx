import { notFound, redirect } from "next/navigation";
import EditPostForm from "@/components/EditPostForm";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getCommunityOptions, getPostForEdit } from "@/lib/queries/post";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  // Returns null unless this user is the post's author
  const post = await getPostForEdit(slug, userId);
  if (!post) notFound();

  const communities = await getCommunityOptions();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      <h1 className="mb-6 text-2xl font-bold">Edit post</h1>
      <EditPostForm post={post} communities={communities} />
    </div>
  );
}
