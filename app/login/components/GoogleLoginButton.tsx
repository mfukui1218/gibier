"use client";

import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { checkAllowedOrAdmin } from "../lib/authGate";

export async function handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const user = result.user;
  const email = user.email?.toLowerCase().trim() ?? "";
  const info = getAdditionalUserInfo(result);

  if (info?.isNewUser) {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email ?? null,
      createdAt: serverTimestamp(),
    });
  }

  if (!email) {
    await signOut(auth);
    throw new Error("Google からメールが取得できませんでした。");
  }

  const allowed = await checkAllowedOrAdmin(email);
  if (!allowed) {
    await signOut(auth);
    throw new Error("このメールアドレスではログインできません。");
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email,
      name: user.displayName ?? "",
      provider: "google",
      createdAt: serverTimestamp(),
    });
  }
}
