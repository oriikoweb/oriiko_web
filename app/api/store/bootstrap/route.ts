import { NextResponse } from "next/server";
import { fetchStoreBootstrap } from "@/lib/store/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchStoreBootstrap();
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

