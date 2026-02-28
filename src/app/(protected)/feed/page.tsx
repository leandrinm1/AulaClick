import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Post } from "@/types";
import PostCard from "@/components/post/PostCard";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Timestamp } from "firebase-admin/firestore";

export const metadata: Metadata = { title: "Feed" };
export const dynamic = "force-dynamic";

async function getLatestPosts(limit = 20): Promise<Post[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("posts")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
}

export default async function FeedPage() {
  const user = await requireSession();
  const posts = await getLatestPosts();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
      <CreatePostForm currentUser={user} />
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={user.uid} />
        ))}
        {posts.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
            No posts yet. Be the first to share something!
          </p>
        )}
      </div>
    </div>
  );
}
