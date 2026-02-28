"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/app/actions/purchase.actions";

interface Props {
  currentUserId: string;
}

export default function CreateProductForm({ currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createProduct(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to create product.");
      } else {
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
      >
        + List Product
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{ background: "white", borderRadius: "var(--radius)", padding: 32, width: "100%", maxWidth: 480 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>List a Product</h2>
        <form action={handleAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input name="title" required minLength={3} maxLength={150} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" required minLength={10} maxLength={3000} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Price (USD)</label>
              <input name="price" type="number" step="0.01" min="0.01" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input name="stock" type="number" step="1" min="0" required style={inputStyle} />
            </div>
          </div>
          {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 6, padding: "9px 20px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 600, cursor: "pointer" }}
            >
              {isPending ? "Listing…" : "List Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
};
