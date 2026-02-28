"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "@/app/actions/user.actions";
import type { SessionUser, User, Wallet, Order } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  session: SessionUser;
  user: User | null;
  wallet: Wallet | null;
  orders: Order[];
}

export default function ProfileView({ session, user, wallet, orders }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function handleUpdate(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateUserProfile(formData);
      if (!result.success) {
        setError(result.error ?? "Update failed.");
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e2e8f0", overflow: "hidden" }}>
            {session.avatarUrl && (
              <img src={session.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{user?.displayName ?? session.displayName}</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>@{user?.username ?? "—"}</p>
            {user?.bio && <p style={{ marginTop: 4, fontSize: 14 }}>{user.bio}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{ border: "1px solid var(--color-border)", background: "white", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid var(--color-border)", background: "white", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "var(--color-danger)" }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {user && (
        <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
          {[
            { label: "Posts", value: user.postsCount },
            { label: "Followers", value: user.followersCount },
            { label: "Following", value: user.followingCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{value}</p>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {wallet && (
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8 }}>WALLET</h2>
          <p style={{ fontSize: 28, fontWeight: 700 }}>${wallet.balance.toFixed(2)}</p>
          {wallet.lockedBalance > 0 && (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
              ${wallet.lockedBalance.toFixed(2)} on hold
            </p>
          )}
        </div>
      )}

      {editing && (
        <form action={handleUpdate} style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 24,
          marginBottom: 32,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Edit Profile</h2>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Display Name</label>
            <input name="displayName" defaultValue={user?.displayName ?? session.displayName} required maxLength={80}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Bio</label>
            <textarea name="bio" defaultValue={user?.bio ?? ""} maxLength={500} rows={3}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
          </div>
          {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={isPending}
              style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 600, cursor: "pointer" }}>
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {orders.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Orders</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((order) => (
              <div key={order.id} style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{order.productTitle}</p>
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Qty: {order.quantity} · ${order.amount.toFixed(2)}
                  </p>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: order.status === "paid" ? "#dcfce7" : "#f1f5f9",
                  color: order.status === "paid" ? "#16a34a" : "var(--color-text-muted)",
                }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
