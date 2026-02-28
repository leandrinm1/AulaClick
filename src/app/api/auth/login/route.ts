import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body as { idToken?: string };

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "idToken is required" }, { status: 400 });
    }

    await createSession(idToken);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/auth/login]", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
