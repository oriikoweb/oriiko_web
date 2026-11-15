export type CloudinaryMediaType = "image" | "video";

export interface CloudinaryMediaItem {
  id?: string;
  url: string;
  mediaType: CloudinaryMediaType;
  altText?: string;
  isPrimary?: boolean;
}

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;

/**
 * Validates that a media link is a secure HTTPS URL hosted on Cloudinary CDN
 * (or rejects base64 data URIs strictly).
 */
export function validateCloudinaryUrl(rawUrl: string): {
  valid: boolean;
  normalizedUrl: string;
  error?: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, normalizedUrl: "", error: "Media URL cannot be empty." };
  }
  if (/^data:/i.test(trimmed) || trimmed.includes(";base64,")) {
    return {
      valid: false,
      normalizedUrl: "",
      error: "Base64 images/videos are not permitted. Provide a Cloudinary CDN URL.",
    };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        normalizedUrl: "",
        error: "Cloudinary media links must use https://.",
      };
    }
    const host = parsed.hostname.toLowerCase();
    const isCloudinary =
      host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
    if (!isCloudinary) {
      return {
        valid: false,
        normalizedUrl: "",
        error:
          "Only Cloudinary CDN URLs (https://res.cloudinary.com/...) are allowed.",
      };
    }
    return { valid: true, normalizedUrl: parsed.toString() };
  } catch {
    return {
      valid: false,
      normalizedUrl: "",
      error: "Enter a valid Cloudinary HTTPS URL.",
    };
  }
}

export function inferCloudinaryMediaType(url: string): CloudinaryMediaType {
  const lower = url.toLowerCase();
  if (lower.includes("/video/upload/") || VIDEO_EXT_RE.test(lower)) {
    return "video";
  }
  return "image";
}

export function isCloudinaryUploadConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

/**
 * Uploads an image or video file directly to Cloudinary CDN (never converting to base64).
 * Supports unsigned upload presets (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` +
 * `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) or server-signed uploads via `/api/admin/cloudinary-sign`.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder = "oriiko"
): Promise<{ url: string; mediaType: CloudinaryMediaType }> {
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const signRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });

  const signData = await signRes.json().catch(() => ({}));
  if (!signRes.ok) {
    throw new Error(
      signData?.error ||
        "Cloudinary upload is not configured. Paste a Cloudinary CDN link instead."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", signData.folder || folder);

  if (signData.mode === "signed") {
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
  } else {
    formData.append("upload_preset", signData.uploadPreset);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    signData.cloudName
  )}/${resourceType}/upload`;

  const uploadRes = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const result = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !result?.secure_url) {
    throw new Error(
      result?.error?.message || "Cloudinary upload failed. Check preset settings."
    );
  }

  return {
    url: String(result.secure_url),
    mediaType:
      result.resource_type === "video" || isVideo ? "video" : "image",
  };
}

