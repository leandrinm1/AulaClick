import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import CreateProductForm from "@/components/product/CreateProductForm";

export const metadata: Metadata = { title: "Marketplace" };
export const dynamic = "force-dynamic";

async function getProducts(limit = 40): Promise<Product[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("products")
    .where("stock", ">", 0)
    .orderBy("stock")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export default async function MarketplacePage() {
  const user = await requireSession();
  const products = await getProducts();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Marketplace</h1>
        <CreateProductForm currentUserId={user.uid} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} currentUserId={user.uid} />
        ))}
        {products.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No products available yet.</p>
        )}
      </div>
    </div>
  );
}
