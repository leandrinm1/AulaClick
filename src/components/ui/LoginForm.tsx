"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSessionCreation(idToken: string, uid: string, userEmail: string, name: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) throw new Error("Session creation failed");

    await fetch("/api/auth/init-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email: userEmail, displayName: name }),
    });

    router.push("/feed");
    router.refresh();
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getClientAuth();
      let userCredential;

      if (mode === "login") {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const idToken = await userCredential.user.getIdToken();
      await handleSessionCreation(
        idToken,
        userCredential.user.uid,
        userCredential.user.email ?? email,
        displayName || userCredential.user.displayName || email.split("@")[0]
      );
    } catch (err: any) {
      const code = err?.code as string;
      const messages: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Invalid email address.",
      };
      setError(messages[code] ?? "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleSessionCreation(
        idToken,
        result.user.uid,
        result.user.email ?? "",
        result.user.displayName ?? ""
      );
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--color-surface)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-sm)",
      border: "1px solid var(--color-border)",
      padding: 40,
      width: "100%",
      maxWidth: 420,
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AulaClick</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        {mode === "login" ? "Sign in to your account" : "Create your account"}
      </p>

      <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "register" && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Jane Doe"
              style={inputStyle}
            />
          </div>
        )}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: 13, background: "#fef2f2", padding: "10px 12px", borderRadius: 6 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={primaryButtonStyle}>
          {loading ? "Loading…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      </div>

      <button onClick={handleGoogleSignIn} disabled={loading} style={secondaryButtonStyle}>
        Continue with Google
      </button>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--color-text-muted)" }}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 14,
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "var(--color-primary)",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "11px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "white",
  color: "var(--color-text)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  padding: "11px 20px",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  width: "100%",
};
