"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";

type Props = {
  user: {
    name: string;
    username?: string;
    bio?: string;
    title?: string;
    image?: string | null;
    email?: string;
  };
};

const initial: ProfileFormState = { ok: false, message: "" };

const input =
  "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none";

const label = "mb-1 block text-xs font-medium text-slate-300";

const MAX_FILE_MB = 5;
const SIZE = 256;

// Center-crop to a square, shrink to 256px, return a small JPEG data URL
async function fileToAvatar(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(
    bmp,
    sx,
    sy,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateProfile,
    initial
  );

  const [image, setImage] = useState(user.image ?? "");
  const [imgError, setImgError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // Refresh server data after a successful save
  useEffect(() => {
    if (state.ok) {
      window.dispatchEvent(new Event("profile:updated"));
      router.refresh();
    }
  }, [state, router]);

  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImgError("");

    if (!file.type.startsWith("image/")) {
      setImgError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setImgError(`Image must be under ${MAX_FILE_MB} MB.`);
      return;
    }

    try {
      setImage(await fileToAvatar(file));
    } catch {
      setImgError("Could not read that image. Try another one.");
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Avatar upload */}
      <div>
        <span className={label}>Profile photo</span>

        <div className="flex items-center gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500 text-2xl font-semibold text-white">
              {initials}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              Upload photo
            </button>

            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPickFile}
            className="hidden"
          />
        </div>

        {imgError && (
          <p className="mt-2 text-xs text-red-400">
            {imgError}
          </p>
        )}

        <input type="hidden" name="image" value={image} />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className={label}>
          Name
        </label>

        <input
          id="name"
          name="name"
          defaultValue={user.name}
          required
          maxLength={50}
          className={input}
        />
      </div>

{/* Professional Title */}
<div>
  <label htmlFor="title" className={label}>
    Professional Title (Optional)
  </label>

  <input
    id="title"
    name="title"
    defaultValue={user.title ?? ""}
    maxLength={50}
    placeholder="e.g. Student, Designer, Software Engineer"
    className={input}
  />

  <p className="mt-1 text-[11px] text-slate-500">
    Tell people what you do. Leave empty if you prefer.
  </p>
</div>

      {/* Username */}
      <div>
        <label htmlFor="username" className={label}>
          Username
        </label>

        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/60 focus-within:border-blue-500">
          <span className="pl-3 text-sm text-slate-500">@</span>

          <input
            id="username"
            name="username"
            defaultValue={user.username ?? ""}
            required
            maxLength={20}
            className="w-full bg-transparent px-2 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <p className="mt-1 text-[11px] text-slate-500">
          3 to 20 characters: letters, numbers and underscores. Your public
          profile lives at /profile/username.
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={label}>
          Bio
        </label>

        <textarea
          id="bio"
          name="bio"
          defaultValue={user.bio ?? ""}
          rows={3}
          maxLength={160}
          placeholder="Tell people a little about yourself"
          className={input}
        />
      </div>

      {/* Email */}
      {user.email && (
        <div>
          <label className={label}>Email</label>

          <input
            value={user.email}
            disabled
            readOnly
            className={`${input} cursor-not-allowed opacity-60`}
          />
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>

        {state.message && (
          <p
            className={`text-sm ${
              state.ok ? "text-green-400" : "text-red-400"
            }`}
            role="status"
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}