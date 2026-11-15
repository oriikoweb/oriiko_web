import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  const { data, error } = await session.supabase.rpc("admin_get_workspace", {
    p_token_hash: session.tokenHash,
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Database workspace query failed. Ensure the latest SQL migration has been executed in Supabase.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ workspace: data, admin: session.user }, { status: 200 });
}

