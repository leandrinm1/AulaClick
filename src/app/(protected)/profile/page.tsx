import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { User, Wallet, Order } from "@/types";
import ProfileView from "@/components/ui/ProfileView";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

async function getUserData(uid: string): Promise<{ user: User | null; wallet: Wallet | null; orders: Order[] }> {
  const db = getAdminFirestore();
  const [userSnap, walletSnap, ordersSnap] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("wallets").doc(uid).get(),
    db.collection("orders").where("buyerId", "==", uid).orderBy("createdAt", "desc").limit(20).get(),
  ]);

  return {
    user: userSnap.exists ? ({ uid, ...userSnap.data() } as User) : null,
    wallet: walletSnap.exists ? (walletSnap.data() as Wallet) : null,
    orders: ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)),
  };
}

export default async function ProfilePage() {
  const session = await requireSession();
  const { user, wallet, orders } = await getUserData(session.uid);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <ProfileView session={session} user={user} wallet={wallet} orders={orders} />
    </div>
  );
}
