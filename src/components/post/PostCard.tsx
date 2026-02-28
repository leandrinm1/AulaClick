import type { Post } from "@/types";
import { likePost, deletePost } from "@/app/actions/post.actions";

interface Props {
  post: Post;
  currentUserId: string;
}

function formatDate(ts: any): string {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((date.getTime() - Date.now()) / 60000),
    "minute"
  );
}

export default function PostCard({ post, currentUserId }: Props) {
  const isOwner = post.authorId === currentUserId;

  return (
    <article style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      padding: "16px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#e2e8f0",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {post.authorAvatar && (
              <img src={post.authorAvatar} alt={post.authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{post.authorName}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <form action={async () => { await deletePost(post.id); }}>
            <button
              type="submit"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 12 }}
            >
              Delete
            </button>
          </form>
        )}
      </div>

      <p style={{ marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{post.content}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 20 }}>
        <form action={likePost.bind(null, post.id)}>
          <button
            type="submit"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}
          >
            ♥ {post.likesCount}
          </button>
        </form>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          💬 {post.commentsCount}
        </span>
      </div>
    </article>
  );
}
