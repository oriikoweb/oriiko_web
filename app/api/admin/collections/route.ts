import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { validateCloudinaryUrl } from "@/lib/media/cloudinary";

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
    const coverImage =
      typeof body?.coverImage === "string" ? body.coverImage.trim() : "";

    if (coverImage) {
      const check = validateCloudinaryUrl(coverImage);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      body.coverImage = check.normalizedUrl;
    }

    const { data, error } = await session.supabase.rpc(
      "admin_upsert_collection",
      {
        p_token_hash: session.tokenHash,
        p_payload: body,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save collection." },
        { status: 400 }
      );
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  return POST(request);
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
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
    }

    const { error } = await session.supabase.rpc("admin_delete_collection", {
      p_token_hash: session.tokenHash,
      p_id: id,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete collection." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

