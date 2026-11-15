import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";

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
    if (!body?.id) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const { error } = await session.supabase.rpc("admin_update_order", {
      p_token_hash: session.tokenHash,
      p_payload: body,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update order." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

