"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/app/actions/post.actions";
import type { SessionUser } from "@/types";

interface Props {
  currentUser: SessionUser;
}

export default function CreatePostForm({ currentUser }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAction(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createPost(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to post.");
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleAction} style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: "16px 20px",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", flexShrink: 0 }}>
          {currentUser.avatarUrl && (
            <img src={currentUser.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          )}
        </div>
        <textarea
          name="content"
          placeholder="Share something..."
          rows={3}
          maxLength={2000}
          required
          style={{
            flex: 1,
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 14,
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>
      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 8 }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
