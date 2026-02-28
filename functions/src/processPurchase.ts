import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

interface PurchasePayload {
  productId: string;
  quantity: number;
}

export const processPurchase = functions
  .runWith({ timeoutSeconds: 30, memory: "256MB" })
  .https.onCall(async (data: PurchasePayload, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }

    const buyerId = context.auth.uid;
    const { productId, quantity } = data;

    if (!productId || typeof productId !== "string" || productId.trim() === "") {
      throw new functions.https.HttpsError("invalid-argument", "Invalid productId.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new functions.https.HttpsError("invalid-argument", "Quantity must be between 1 and 100.");
    }

    const productRef = db.collection("products").doc(productId);
    const buyerWalletRef = db.collection("wallets").doc(buyerId);
    const sellerWalletRef = (sellerId: string) => db.collection("wallets").doc(sellerId);
    const orderRef = db.collection("orders").doc();
    const txRef = db.collection("walletTransactions").doc();

    try {
      const result = await db.runTransaction(async (tx) => {
        const [productSnap, buyerWalletSnap] = await Promise.all([
          tx.get(productRef),
          tx.get(buyerWalletRef),
        ]);

        if (!productSnap.exists) {
          throw new functions.https.HttpsError("not-found", "Product not found.");
        }

        const product = productSnap.data()!;
        const sellerId: string = product.sellerId;

        if (sellerId === buyerId) {
          throw new functions.https.HttpsError("failed-precondition", "Cannot purchase your own product.");
        }

        const pricePerUnit: number = product.price;
        const stock: number = product.stock;
        const totalAmount = pricePerUnit * quantity;

        if (stock < quantity) {
          throw new functions.https.HttpsError("failed-precondition", "Insufficient stock.");
        }

        if (!buyerWalletSnap.exists) {
          throw new functions.https.HttpsError("failed-precondition", "Buyer wallet not found.");
        }

        const buyerWallet = buyerWalletSnap.data()!;
        const buyerBalance: number = buyerWallet.balance;

        if (buyerBalance < totalAmount) {
          throw new functions.https.HttpsError("failed-precondition", "Insufficient balance.");
        }

        const sellerWalletSnap = await tx.get(sellerWalletRef(sellerId));
        if (!sellerWalletSnap.exists) {
          throw new functions.https.HttpsError("internal", "Seller wallet not found.");
        }

        const sellerWallet = sellerWalletSnap.data()!;
        const now = admin.firestore.FieldValue.serverTimestamp();
        const orderId = orderRef.id;

        tx.update(buyerWalletRef, {
          balance: admin.firestore.FieldValue.increment(-totalAmount),
          updatedAt: now,
        });

        tx.update(sellerWalletRef(sellerId), {
          balance: admin.firestore.FieldValue.increment(totalAmount),
          updatedAt: now,
        });

        tx.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-quantity),
        });

        tx.set(orderRef, {
          buyerId,
          sellerId,
          productId,
          productTitle: product.title,
          quantity,
          unitPrice: pricePerUnit,
          amount: totalAmount,
          status: "paid",
          createdAt: now,
        });

        tx.set(txRef, {
          type: "debit",
          amount: totalAmount,
          fromUserId: buyerId,
          toUserId: sellerId,
          orderId,
          createdAt: now,
        });

        return { orderId, amount: totalAmount, sellerId };
      });

      return { success: true, orderId: result.orderId };
    } catch (err) {
      if (err instanceof functions.https.HttpsError) throw err;
      functions.logger.error("processPurchase failed", err);
      throw new functions.https.HttpsError("internal", "Purchase failed. Please try again.");
    }
  });
