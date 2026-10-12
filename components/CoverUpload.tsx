"use client";

import { useRef, useState } from "react";

const MAX_WIDTH = 1200;
const MAX_FILE_MB = 10;

// Shrink to at most 1200px wide and re-encode as JPEG (typically 80-200 KB)
async function resizeToJpeg(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bmp.width);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bmp, 0, 0, w, h);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      0.85
    )
  );
}

export default function CoverUpload({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const blob = await resizeToJpeg(file);
      const body = new FormData();
      body.append("file", blob, "cover.jpg");

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setValue(data.url); // e.g. /api/images/6ac7...
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor="cover" className="mb-1.5 block text-sm text-gray-300">
        Cover image <span className="text-gray-500">(optional)</span>
      </label>

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Cover preview"
          className="mb-3 aspect-[2/1] w-full rounded-lg border border-gray-800 object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload from device"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-red-300"
          >
            Remove
          </button>
        )}

        <span className="text-xs text-gray-500">or paste an image URL:</span>
      </div>

      {/* type="text", not "url": the browser would reject the relative /api/images/... path */}
      <input
        id="cover"
        name="cover"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://..."
        className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onPickFile}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}