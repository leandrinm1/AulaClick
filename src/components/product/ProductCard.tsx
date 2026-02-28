"use client";

import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getClientFunctions } from "@/lib/firebase-client";
import type { Product } from "@/types";

interface Props {
  product: Product;
  currentUserId: string;
}

export default function ProductCard({ product, currentUserId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const isOwner = product.sellerId === currentUserId;

  async function handlePurchase() {
    if (loading || isOwner) return;
    setLoading(true);
    setResult(null);

    try {
      const functions = getClientFunctions();
      const processPurchase = httpsCallable<{ productId: string; quantity: number }, { orderId: string }>(
        functions,
        "processPurchase"
      );
      const response = await processPurchase({ productId: product.id, quantity: 1 });
      setResult({ success: true, message: `Purchase successful! Order ID: ${response.data.orderId}` });
    } catch (err: any) {
      setResult({ success: false, message: err?.message ?? "Purchase failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{product.title}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", flex: 1 }}>
        {product.description.length > 120 ? product.description.slice(0, 120) + "…" : product.description}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>
          ${product.price.toFixed(2)}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {product.stock} in stock
        </span>
      </div>
      {result && (
        <p style={{ fontSize: 12, color: result.success ? "#16a34a" : "var(--color-danger)" }}>
          {result.message}
        </p>
      )}
      {!isOwner && (
        <button
          onClick={handlePurchase}
          disabled={loading || product.stock === 0}
          style={{
            background: product.stock === 0 ? "#e2e8f0" : "var(--color-primary)",
            color: product.stock === 0 ? "var(--color-text-muted)" : "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontWeight: 600,
            fontSize: 14,
            cursor: product.stock === 0 || loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Processing…" : product.stock === 0 ? "Out of Stock" : "Buy Now"}
        </button>
      )}
      {isOwner && (
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center" }}>Your listing</span>
      )}
    </div>
  );
}
