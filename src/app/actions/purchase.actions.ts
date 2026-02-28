"use server";

import { requireSession } from "@/lib/auth";
import { purchaseSchema } from "@/lib/validation";
import type { ActionResult } from "@/types";

export async function initiatePurchase(
  productId: string,
  quantity: number
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const user = await requireSession();

    const parsed = purchaseSchema.safeParse({ productId, quantity });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // The actual purchase is executed in the Cloud Function via the client SDK.
    // This server action validates inputs and returns them for client-side callable invocation.
    // The client will then call the Firebase Cloud Function with the user's ID token.
    return {
      success: true,
      data: { orderId: "" }, // orderId returned by Cloud Function
    };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "You must be logged in." };
    }
    console.error("[initiatePurchase]", err);
    return { success: false, error: "Purchase failed." };
  }
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  "use server";

  try {
    const user = await requireSession();
    const { createProductSchema } = await import("@/lib/validation");
    const { getAdminFirestore } = await import("@/lib/firebase-admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const { revalidatePath } = await import("next/cache");

    const parsed = createProductSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const db = getAdminFirestore();
    const productRef = db.collection("products").doc();

    await productRef.set({
      sellerId: user.uid,
      ...parsed.data,
      rating: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/marketplace");
    return { success: true, data: { id: productRef.id } };
  } catch (err) {
    console.error("[createProduct]", err);
    return { success: false, error: "Failed to create product." };
  }
}
