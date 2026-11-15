import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const folder =
    typeof body?.folder === "string" && body.folder.trim()
      ? body.folder.trim()
      : "oriiko";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    return NextResponse.json(
      {
        error:
          "Direct upload requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in environment variables. You can paste Cloudinary CDN URLs directly in the field below.",
      },
      { status: 400 }
    );
  }

  if (apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    return NextResponse.json({
      mode: "signed",
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
    });
  }

  if (uploadPreset) {
    return NextResponse.json({
      mode: "unsigned",
      cloudName,
      uploadPreset,
      folder,
    });
  }

  return NextResponse.json(
    {
      error:
        "Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (or CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET) in .env.local to enable direct file uploads, or paste a Cloudinary CDN link directly.",
    },
    { status: 400 }
  );
}

