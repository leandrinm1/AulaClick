"use server";

import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { ActionResult } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();

    if (!targetUserId?.trim()) return { success: false, error: "Invalid user ID." };
    if (targetUserId === user.uid) return { success: false, error: "Cannot follow yourself." };

    const db = getAdminFirestore();
    const followRef = db.collection("users").doc(user.uid).collection("following").doc(targetUserId);
    const currentUserRef = db.collection("users").doc(user.uid);
    const targetUserRef = db.collection("users").doc(targetUserId);

    await db.runTransaction(async (tx) => {
      const [followSnap, targetSnap] = await Promise.all([
        tx.get(followRef),
        tx.get(targetUserRef),
      ]);

      if (!targetSnap.exists) throw new Error("User not found.");

      if (followSnap.exists) {
        tx.delete(followRef);
        tx.update(currentUserRef, { followingCount: FieldValue.increment(-1) });
        tx.update(targetUserRef, { followersCount: FieldValue.increment(-1) });
      } else {
        tx.set(followRef, { createdAt: FieldValue.serverTimestamp() });
        tx.update(currentUserRef, { followingCount: FieldValue.increment(1) });
        tx.update(targetUserRef, { followersCount: FieldValue.increment(1) });
      }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "User not found.") {
      return { success: false, error: "User not found." };
    }
    console.error("[followUser]", err);
    return { success: false, error: "Failed to update follow status." };
  }
}
