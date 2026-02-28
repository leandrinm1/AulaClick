"use server";

import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { createPostSchema } from "@/lib/validation";
import type { ActionResult } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireSession();

    const parsed = createPostSchema.safeParse({
      content: formData.get("content"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const db = getAdminFirestore();
    const postRef = db.collection("posts").doc();

    await postRef.set({
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.avatarUrl,
      content: parsed.data.content,
      likesCount: 0,
      commentsCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    await db.collection("users").doc(user.uid).update({
      postsCount: FieldValue.increment(1),
    });

    revalidatePath("/feed");
    return { success: true, data: { id: postRef.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "You must be logged in." };
    }
    console.error("[createPost]", err);
    return { success: false, error: "Failed to create post." };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();

    if (!postId?.trim()) return { success: false, error: "Invalid post ID." };

    const db = getAdminFirestore();
    const postRef = db.collection("posts").doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) return { success: false, error: "Post not found." };
    if (postSnap.data()!.authorId !== user.uid) {
      return { success: false, error: "Not authorized to delete this post." };
    }

    await postRef.delete();
    await db.collection("users").doc(user.uid).update({
      postsCount: FieldValue.increment(-1),
    });

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    console.error("[deletePost]", err);
    return { success: false, error: "Failed to delete post." };
  }
}

export async function likePost(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();
    if (!postId?.trim()) return { success: false, error: "Invalid post ID." };

    const db = getAdminFirestore();
    const likeRef = db.collection("posts").doc(postId).collection("likes").doc(user.uid);
    const postRef = db.collection("posts").doc(postId);

    await db.runTransaction(async (tx) => {
      const likeSnap = await tx.get(likeRef);
      if (likeSnap.exists) {
        tx.delete(likeRef);
        tx.update(postRef, { likesCount: FieldValue.increment(-1) });
      } else {
        tx.set(likeRef, { createdAt: FieldValue.serverTimestamp() });
        tx.update(postRef, { likesCount: FieldValue.increment(1) });
      }
    });

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    console.error("[likePost]", err);
    return { success: false, error: "Failed to toggle like." };
  }
}
