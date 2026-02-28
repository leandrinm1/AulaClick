import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth";

export async function POST(_request: NextRequest) {
  await revokeSession();
  return NextResponse.json({ success: true });
}
