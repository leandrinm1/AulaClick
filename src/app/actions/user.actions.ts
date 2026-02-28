"use server";

import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { updateUserProfileSchema } from "@/lib/validation";
import type { ActionResult } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = updateUserProfileSchema.safeParse({
      displayName: formData.get("displayName"),
      bio: formData.get("bio"),
      avatarUrl: formData.get("avatarUrl") ?? "",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const db = getAdminFirestore();
    await db.collection("users").doc(user.uid).update({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      ...(parsed.data.avatarUrl ? { avatarUrl: parsed.data.avatarUrl } : {}),
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[updateUserProfile]", err);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function initializeUserRecord(
  uid: string,
  email: string,
  displayName: string
): Promise<ActionResult> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(uid);
    const walletRef = db.collection("wallets").doc(uid);

    const userSnap = await userRef.get();
    if (userSnap.exists) return { success: true };

    const now = FieldValue.serverTimestamp();
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const batch = db.batch();
    batch.set(userRef, {
      displayName,
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

    return { success: true };
  } catch (err) {
    console.error("[initializeUserRecord]", err);
    return { success: false, error: "Failed to initialize user." };
  }
}
