"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePostAction, type EditPostState } from "@/app/actions/posts";

type Props = {
  post: {
    _id: string;
    slug: string;
    title: string;
    content: string;
    cover?: string;
    topics: string[];
    community: string; // community _id
    published: boolean;
  };
  communities: { _id: string; name: string }[];
};

const inputClass =
  "w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none";
const labelClass = "mb-1.5 block text-sm text-gray-300";

export default function EditPostForm({ post, communities }: Props) {
  const [state, formAction, pending] = useActionState<EditPostState, FormData>(
    updatePostAction.bind(null, post._id),
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={post.title}
          maxLength={200}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cover" className={labelClass}>
          Cover image <span className="text-gray-500">(optional)</span>
        </label>
        <input
          id="cover"
          name="cover"
          type="url"
          defaultValue={post.cover ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="community" className={labelClass}>
          Community
        </label>
        <select
          id="community"
          name="community"
          required
          defaultValue={post.community}
          className={inputClass}
        >
          {communities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          required
          defaultValue={post.content}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="topics" className={labelClass}>
          Topics
        </label>
        <input
          id="topics"
          name="topics"
          defaultValue={post.topics.join(", ")}
          placeholder="nextjs, react, tailwind (max 5, comma separated)"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post.published}
          className="h-4 w-4 accent-indigo-500"
        />
        Published (uncheck to keep it as a draft)
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>

        <Link
          href={`/blogs/${post.slug}`}
          className="rounded-lg border border-gray-700 px-5 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}