"use client";

import React, { useRef, useState } from "react";
import {
  type CloudinaryMediaItem,
  inferCloudinaryMediaType,
  isCloudinaryUploadConfigured,
  uploadFileToCloudinary,
  validateCloudinaryUrl,
} from "@/lib/media/cloudinary";
import { IconClose } from "@/components/ui/Icons";
import { IconImage, IconTrash, IconUpload, IconVideo } from "./AdminIcons";

interface SingleCloudinaryFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  folder?: string;
  accept?: string;
  allowClear?: boolean;
}

/**
 * Single-asset Cloudinary CDN URL & optional direct upload input.
 * Rejects local base64 / data URLs and validates `res.cloudinary.com` HTTPS links.
 */
export function SingleCloudinaryField({
  label,
  value,
  onChange,
  placeholder = "https://res.cloudinary.com/<cloud>/image/upload/...",
  helperText,
  folder = "oriiko/assets",
  accept = "image/*,.svg,.ico,.png,.webp,.jpg,.jpeg",
  allowClear = true,
}: SingleCloudinaryFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlInput = urlDraft ?? value;
  const uploadConfigured = isCloudinaryUploadConfigured();

  const handleApplyUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setError(null);
      setUrlDraft(null);
      onChange("");
      return;
    }
    const check = validateCloudinaryUrl(trimmed);
    if (!check.valid) {
      setError(check.error || "Invalid Cloudinary CDN URL.");
      return;
    }
    setError(null);
    setUrlDraft(null);
    onChange(check.normalizedUrl);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadFileToCloudinary(file, folder);
      setUrlDraft(null);
      onChange(uploaded.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload file to Cloudinary."
      );
    } finally {
      setUploading(false);
    }
  };

  const currentType = value ? inferCloudinaryMediaType(value) : "image";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#26231F] dark:text-[#F2F2F0]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {uploadConfigured && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
              >
                <IconUpload className="w-3 h-3" />
                {uploading ? "Uploading..." : "Upload to Cloudinary"}
              </button>
            </>
          )}
          {allowClear && value && (
            <button
              type="button"
              onClick={() => {
                setUrlDraft(null);
                setError(null);
                onChange("");
              }}
              className="text-[11px] font-medium text-[#8C072B] dark:text-[#F2F2F0]/80 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlDraft(e.target.value)}
          onBlur={() => handleApplyUrl(urlInput)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApplyUrl(urlInput);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] font-mono focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
        />
        <button
          type="button"
          onClick={() => handleApplyUrl(urlInput)}
          className="px-3 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 text-[#26231F] dark:text-[#F2F2F0] hover:border-[#591623] dark:hover:border-[#F2F2F0] transition-colors shrink-0"
        >
          Apply CDN URL
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
          {helperText}
        </p>
      )}

      {!uploadConfigured && (
        <p className="text-[11px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
          Paste any <span className="font-mono">https://res.cloudinary.com/...</span> asset link.
          Configure <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span> &amp;{" "}
          <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</span> in{" "}
          <span className="font-mono">.env.local</span> to enable direct browser uploads.
        </p>
      )}

      {error && (
        <p className="text-[11px] text-[#8C072B] font-medium" role="alert">
          {error}
        </p>
      )}

      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
          <div className="w-12 h-12 rounded-[4px] overflow-hidden border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#26231F] shrink-0 flex items-center justify-center">
            {currentType === "video" ? (
              <video
                src={value}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Cloudinary asset preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[#26231F] dark:text-[#F2F2F0] uppercase tracking-wider">
              Cloudinary {currentType === "video" ? "Video" : "Image"} Active
            </p>
            <p className="text-[11px] font-mono text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
              {value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductMediaGalleryPickerProps {
  media: CloudinaryMediaItem[];
  onChange: (next: CloudinaryMediaItem[]) => void;
  folder?: string;
}

/**
 * Multi-item Cloudinary CDN gallery manager for product images & videos.
 * Enforces Cloudinary URLs (no base64/data URIs) and supports cover designation.
 */
export function ProductMediaGalleryPicker({
  media,
  onChange,
  folder = "oriiko/products",
}: ProductMediaGalleryPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [mediaTypeOverride, setMediaTypeOverride] = useState<"auto" | "image" | "video">(
    "auto"
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadConfigured = isCloudinaryUploadConfigured();

  const normalizeGallery = (list: CloudinaryMediaItem[]): CloudinaryMediaItem[] => {
    if (list.length === 0) return [];
    const hasPrimary = list.some((m) => m.isPrimary);
    if (!hasPrimary) {
      return list.map((m, idx) => ({ ...m, isPrimary: idx === 0 }));
    }
    return list;
  };

  const handleAddUrl = () => {
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError("Paste a https://res.cloudinary.com/... URL to add media.");
      return;
    }

    const check = validateCloudinaryUrl(trimmed);
    if (!check.valid) {
      setError(check.error || "Invalid Cloudinary URL.");
      return;
    }

    if (media.some((item) => item.url === check.normalizedUrl)) {
      setError("This Cloudinary media link is already in the gallery.");
      return;
    }

    const detected =
      mediaTypeOverride === "auto"
        ? inferCloudinaryMediaType(check.normalizedUrl)
        : mediaTypeOverride;

    const next = normalizeGallery([
      ...media,
      {
        url: check.normalizedUrl,
        mediaType: detected,
        altText: altInput.trim() || undefined,
        isPrimary: media.length === 0,
      },
    ]);
    onChange(next);
    setUrlInput("");
    setAltInput("");
    setMediaTypeOverride("auto");
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      const uploadedItems: CloudinaryMediaItem[] = [];
      for (const file of files) {
        const res = await uploadFileToCloudinary(file, folder);
        uploadedItems.push({
          url: res.url,
          mediaType: res.mediaType,
          isPrimary: media.length === 0 && uploadedItems.length === 0,
        });
      }
      onChange(normalizeGallery([...media, ...uploadedItems]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload one or more files."
      );
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = (idx: number) => {
    const target = media[idx];
    if (!target) return;
    const reordered = [
      { ...target, isPrimary: true },
      ...media
        .filter((_, i) => i !== idx)
        .map((m) => ({ ...m, isPrimary: false })),
    ];
    onChange(reordered);
  };

  const removeItem = (idx: number) => {
    const filtered = media.filter((_, i) => i !== idx);
    onChange(normalizeGallery(filtered));
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= media.length) return;
    const copy = [...media];
    const [moved] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, moved);
    onChange(normalizeGallery(copy));
  };

  return (
    <div className="space-y-3">
      {/* Add URL or Direct Upload Row */}
      <div className="p-3.5 rounded-[6px] border border-dashed border-[#26231F]/25 dark:border-[#F2F2F0]/25 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.03] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              Add Cloudinary CDN Image or Video
            </p>
            <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
              First image acts as the primary storefront card thumbnail. Videos auto-play in the
              PDP gallery.
            </p>
          </div>
          {uploadConfigured && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/quicktime"
                onChange={handleFilesUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
              >
                <IconUpload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload Media"}
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_110px_auto] gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="https://res.cloudinary.com/<cloud>/image/upload/v1/oriiko/look-01.jpg"
            className="px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] font-mono focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
          <input
            type="text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder="Alt / view label"
            className="px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
          <select
            value={mediaTypeOverride}
            onChange={(e) =>
              setMediaTypeOverride(e.target.value as "auto" | "image" | "video")
            }
            aria-label="Media type"
            className="px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] focus:outline-none"
          >
            <option value="auto">Auto Type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3.5 py-2 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors shrink-0"
          >
            Add Link
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-[#8C072B] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="p-6 text-center rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
          No product media added yet. Add at least one Cloudinary CDN image or video link above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className={`group rounded-[5px] border overflow-hidden bg-[#F2F2F0] dark:bg-[#26231F] flex flex-col ${
                item.isPrimary
                  ? "border-[#591623] dark:border-[#F2F2F0]"
                  : "border-[#26231F]/15 dark:border-[#F2F2F0]/15"
              }`}
            >
              <div className="relative aspect-[3/4] bg-[#26231F]/5 dark:bg-[#F2F2F0]/5 overflow-hidden">
                {item.mediaType === "video" ? (
                  <video
                    src={item.url}
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.altText || `Product media ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#26231F] text-[#F2F2F0]">
                  {item.mediaType === "video" ? (
                    <IconVideo className="w-2.5 h-2.5" />
                  ) : (
                    <IconImage className="w-2.5 h-2.5" />
                  )}
                  {item.isPrimary ? "Cover" : `#${idx + 1}`}
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  aria-label="Remove media item"
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-[4px] bg-[#8C072B] text-[#F2F2F0] flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                >
                  <IconTrash className="w-3 h-3" />
                </button>
              </div>

              <div className="p-2 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 flex items-center justify-between gap-1">
                {!item.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="text-[10px] font-semibold text-[#591623] dark:text-[#F2F2F0] hover:underline"
                  >
                    Set Cover
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
                    Primary
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    aria-label="Move earlier"
                    className="px-1.5 py-0.5 text-[10px] rounded-[3px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 disabled:opacity-30"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    disabled={idx === media.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    aria-label="Move later"
                    className="px-1.5 py-0.5 text-[10px] rounded-[3px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 disabled:opacity-30"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
          <span>{media.length} Cloudinary media item{media.length === 1 ? "" : "s"} linked</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="inline-flex items-center gap-1 text-[#8C072B] hover:underline"
          >
            <IconClose className="w-3 h-3" />
            Clear all media
          </button>
        </div>
      )}
    </div>
  );
}
