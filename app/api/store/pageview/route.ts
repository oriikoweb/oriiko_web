import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.slice(0, 250) : "/";
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.slice(0, 80) : "";
    const device =
      body?.device === "mobile" || body?.device === "tablet"
        ? body.device
        : "desktop";
    const referrer =
      typeof body?.referrer === "string" && body.referrer
        ? body.referrer.slice(0, 300)
        : null;

    if (!sessionId) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = getDbClient();
    await supabase.rpc("record_store_page_view", {
      p_path: path,
      p_session_id: sessionId,
      p_device: device,
      p_referrer: referrer,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

