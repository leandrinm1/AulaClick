import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "@/components/ui/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/feed");

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoginForm />
    </main>
  );
}
