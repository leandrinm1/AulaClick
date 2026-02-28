import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import Navbar from "@/components/ui/Navbar";
import type { ReactNode } from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  let user;
  try {
    user = await requireSession();
  } catch {
    redirect("/login");
  }

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
