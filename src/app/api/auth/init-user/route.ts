import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName } = (await request.json()) as {
      uid?: string;
      email?: string;
      displayName?: string;
    };

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the UID actually exists in Firebase Auth
    const auth = getAdminAuth();
    await auth.getUser(uid);

    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(uid);
    const walletRef = db.collection("wallets").doc(uid);

    const userSnap = await userRef.get();
    if (userSnap.exists) {
      return NextResponse.json({ success: true });
    }

    const now = FieldValue.serverTimestamp();
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const safeDisplayName = displayName?.trim() || username;

    const batch = db.batch();
    batch.set(userRef, {
      displayName: safeDisplayName,
      username,
      email,
      avatarUrl: "",
      bio: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: now,
    });
    batch.set(walletRef, {
      balance: 0,
      lockedBalance: 0,
      updatedAt: now,
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/auth/init-user]", err);
    return NextResponse.json({ error: "Failed to initialize user" }, { status: 500 });
  }
}
