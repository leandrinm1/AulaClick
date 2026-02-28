import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALk75sZrwbwI4WPNjb9JT7NwXwcuQq7Kk",
  authDomain: "aulaclick-41412.firebaseapp.com",
  projectId: "aulaclick-41412",
  storageBucket: "aulaclick-41412.firebasestorage.app",
  messagingSenderId: "185161844949",
  appId: "1:185161844949:web:a601e39a9a36c5599bba5c",
  measurementId: "G-Q51Z828R14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
