import Link from "next/link";
import type { SessionUser } from "@/types";

interface Props {
  user: SessionUser;
}

export default function Navbar({ user }: Props) {
  return (
    <nav style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/feed" style={{ fontWeight: 800, fontSize: 18, color: "var(--color-primary)" }}>
          AulaClick
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/feed" style={{ fontSize: 14, fontWeight: 500 }}>Feed</Link>
          <Link href="/marketplace" style={{ fontSize: 14, fontWeight: 500 }}>Marketplace</Link>
          <Link href="/profile" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 500 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0", overflow: "hidden" }}>
              {user.avatarUrl && <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            {user.displayName}
          </Link>
        </div>
      </div>
    </nav>
  );
}
