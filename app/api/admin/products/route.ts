import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  inferCloudinaryMediaType,
  validateCloudinaryUrl,
} from "@/lib/media/cloudinary";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const rawMedia = Array.isArray(body?.media) ? body.media : [];
    const normalizedMedia: Array<{
      url: string;
      mediaType: "image" | "video";
      altText: string;
      isPrimary: boolean;
    }> = [];

    for (let i = 0; i < rawMedia.length; i++) {
      const item = rawMedia[i];
      const url = typeof item?.url === "string" ? item.url.trim() : "";
      if (!url) continue;
      const check = validateCloudinaryUrl(url);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      normalizedMedia.push({
        url: check.normalizedUrl,
        mediaType:
          item?.mediaType === "video" ||
          inferCloudinaryMediaType(check.normalizedUrl) === "video"
            ? "video"
            : "image",
        altText: typeof item?.altText === "string" ? item.altText.trim() : "",
        isPrimary: Boolean(item?.isPrimary ?? i === 0),
      });
    }

    body.media = normalizedMedia;

    const { data, error } = await session.supabase.rpc("admin_upsert_product", {
      p_token_hash: session.tokenHash,
      p_payload: body,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save product." },
        { status: 400 }
      );
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

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
    if (Array.isArray(body?.ids) && typeof body?.status === "string") {
      const { error } = await session.supabase.rpc(
        "admin_update_product_status",
        {
          p_token_hash: session.tokenHash,
          p_ids: body.ids,
          p_status: body.status,
        }
      );
      if (error) {
        return NextResponse.json(
          { error: error.message || "Failed to update product status." },
          { status: 400 }
        );
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return POST(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify(body),
      })
    );
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids.filter((x: unknown) => typeof x === "string" && x)
      : typeof body?.id === "string" && body.id
        ? [body.id]
        : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "At least one product ID is required." },
        { status: 400 }
      );
    }

    const { error } = await session.supabase.rpc("admin_delete_products", {
      p_token_hash: session.tokenHash,
      p_ids: ids,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete product(s)." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

