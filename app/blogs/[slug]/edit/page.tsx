import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FilePenLine } from "lucide-react";
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

  const post = await getPostForEdit(slug, userId);
  if (!post) notFound();

  const communities = await getCommunityOptions();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-10">
      <Link
        href={`/blogs/${slug}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to post
      </Link>

      <div className="mb-7 border-b border-slate-800 pb-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
          <FilePenLine className="h-4 w-4" />
          Post editor
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Edit post
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Update your content, topics, community, and publishing settings.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-[#0f1629] p-5 shadow-2xl shadow-black/20 sm:p-7 lg:p-8">
        <EditPostForm post={post} communities={communities} />
      </section>
    </main>
  );
}