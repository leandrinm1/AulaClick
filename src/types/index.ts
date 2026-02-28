import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Timestamp;
}

export interface Wallet {
  balance: number;
  lockedBalance: number;
  updatedAt: Timestamp;
}

export type WalletTransactionType = "debit" | "credit" | "hold" | "release";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  fromUserId: string;
  toUserId: string;
  orderId: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  createdAt: Timestamp;
}

export type OrderStatus = "pending" | "paid" | "delivered" | "completed" | "cancelled";

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
}

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  username: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
