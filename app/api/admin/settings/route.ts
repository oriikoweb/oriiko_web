import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { validateCloudinaryUrl } from "@/lib/media/cloudinary";

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (body?.storeSettings) {
      const faviconUrl =
        typeof body.storeSettings.faviconUrl === "string"
          ? body.storeSettings.faviconUrl.trim()
          : "";
      if (faviconUrl) {
        const check = validateCloudinaryUrl(faviconUrl);
        if (!check.valid) {
          return NextResponse.json({ error: check.error }, { status: 400 });
        }
        body.storeSettings.faviconUrl = check.normalizedUrl;
      } else {
        body.storeSettings.faviconUrl = null;
      }

      // heroVideoUrl: accept any non-empty string URL (Cloudinary or external CDN)
      const heroVideoUrl =
        typeof body.storeSettings.heroVideoUrl === "string"
          ? body.storeSettings.heroVideoUrl.trim()
          : "";
      body.storeSettings.heroVideoUrl = heroVideoUrl || null;
    }

    const { error } = await session.supabase.rpc("admin_update_settings", {
      p_token_hash: session.tokenHash,
      p_payload: body,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save settings." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

