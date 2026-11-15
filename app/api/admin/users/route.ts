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

  try {
    const body = await request.json();
    if (body?.role !== undefined) {
      body.role = body.role === "admin" ? "admin" : "customer";
    }

    const { data, error } = await session.supabase.rpc("admin_upsert_user", {
      p_token_hash: session.tokenHash,
      p_payload: body,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save user." },
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

