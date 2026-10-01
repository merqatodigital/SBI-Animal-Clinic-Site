"use client";

import { useEffect, useState } from "react";
import type { MediaAsset } from "@/lib/cms";

function storedKey(): string {
  try {
    return localStorage.getItem("sbi_admin_passkey") || sessionStorage.getItem("sbi_admin_passkey") || "5309";
  } catch {
    return "5309";
  }
}

function authHeaders(): HeadersInit {
  return { "x-sbi-passkey": storedKey() };
}

function mediaSrc(url: string) {
  return /^(https?:|data:)/i.test(url) || url.startsWith("/") ? url : `/${url}`;
}

/**
 * Reusable media field for the admin: pick from the library, upload straight
 * from the device (images + videos), or paste a URL. Shows a live preview.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  accept = "image/*,video/*",
  hint,
  previewFit = "cover",
  multiple = true,
  inlineMaxBytes,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  hint?: string;
  previewFit?: "cover" | "contain";
  multiple?: boolean;
  /**
   * When set, a device upload is stored inline: the original file bytes are
   * embedded unchanged as a data URL in the saved setting (no re-encoding,
   * cropping or resizing). This works on read-only hosts such as Vercel,
   * where files cannot be written to public/uploads at runtime.
   */
  inlineMaxBytes?: number;
}) {
  const [library, setLibrary] = useState<MediaAsset[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) || value.startsWith("uploads/") && false;

  const load = async () => {
    try {
      const res = await fetch("/api/admin/media", { headers: authHeaders(), credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setLibrary(json.media ?? []);
      }
    } catch {
      /* offline */
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  async function uploadInline(file: File, maxBytes: number) {
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (PNG, JPG, WebP, GIF or SVG).");
      return;
    }
    if (file.size > maxBytes) {
      alert(`Image is too large — ${(maxBytes / 1024 / 1024).toFixed(0)} MB maximum.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
      });
      onChange(dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 10);
    if (list.length === 0) return;
    if (inlineMaxBytes) {
      await uploadInline(list[0], inlineMaxBytes);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      list.forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setLibrary((l) => [...(json.media ?? []), ...l]);
      if (json.media?.[0]?.url) onChange(json.media[0].url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="plate-label text-steel">{label}</span>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          value={value.startsWith("data:") ? "Uploaded image (saved with settings)" : value}
          readOnly={value.startsWith("data:")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="uploads/… or https://…"
          className="h-12 flex-1 border border-hair bg-white px-3 text-[14px] text-ink focus:border-cyan focus:outline-none"
        />
        <div className="flex gap-2">
          <label className="cursor-pointer border border-hair bg-paper px-4 py-3 text-[12px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep">
            {uploading ? "Uploading…" : "⬆ From device"}
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              className="sr-only"
              onChange={(e) => e.target.files && upload(e.target.files)}
            />
          </label>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="border border-hair bg-white px-4 py-3 text-[12px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep"
            aria-expanded={open}
          >
            Library
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="border border-hair px-3 py-3 text-[12px] font-bold text-steel hover:border-alert hover:text-alert"
              aria-label={`Clear ${label}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {value && (
        <div className="mt-2 border border-hair bg-paper p-2">
          {isVideo || value.endsWith(".mp4") || value.endsWith(".webm") ? (
            <video src={mediaSrc(value)} controls className="max-h-44 w-full bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc(value)}
              alt={`${label} preview`}
              className={previewFit === "contain" ? "h-44 w-full bg-white object-contain" : "max-h-44 w-full object-cover"}
            />
          )}
        </div>
      )}

      {open && (
        <div
          className={`mt-2 border-2 border-dashed p-3 ${drag ? "border-cyan bg-cyan-soft/40" : "border-hair bg-white"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
        >
          <p className="text-[13px] text-steel">
            Drag &amp; drop images or videos here, or{" "}
            <label className="cursor-pointer font-bold text-navy underline underline-offset-2">
              browse device
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                className="sr-only"
                onChange={(e) => e.target.files && upload(e.target.files)}
              />
            </label>
          </p>
          {library.length === 0 ? (
            <p className="mt-2 text-[13px] text-steel">Library is empty — upload your first file.</p>
          ) : (
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {library.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(m.url);
                      setOpen(false);
                    }}
                    className={`block w-full border-2 transition-all hover:-translate-y-0.5 ${value === m.url ? "border-cyan" : "border-hair"}`}
                    title={`${m.fileName} — click to use`}
                  >
                    {m.kind === "video" ? (
                      <video src={mediaSrc(m.url)} className="h-20 w-full bg-black object-cover" muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaSrc(m.url)} alt={m.fileName} className="h-20 w-full object-cover" loading="lazy" />
                    )}
                    <span className="block truncate px-1 py-0.5 text-left text-[10px] text-steel">
                      {m.kind} · {(m.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {hint && <p className="mt-1 text-[12px] text-steel">{hint}</p>}
    </div>
  );
}
