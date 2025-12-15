"use client";

import {
  OAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { checkAllowedOrAdmin } from "../lib/authGate";

export async function handleAppleLogin() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");

  const result = await signInWithPopup(auth, provider);

  const user = result.user;
  const info = getAdditionalUserInfo(result);

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // Apple は2回目以降 email が空になりがち → Firestore保存値で救済
  let email = user.email?.toLowerCase().trim() ?? "";
  if (!email && snap.exists()) {
    const saved = snap.data()?.email;
    if (typeof saved === "string") email = saved.toLowerCase().trim();
  }

  // 初回ログインのときだけ users を最低限作る（Googleと同じ）
  if (info?.isNewUser && !snap.exists()) {
    await setDoc(userRef, {
      email: email || null,
      createdAt: serverTimestamp(),
    });
  }

  if (!email) {
    await signOut(auth);
    throw new Error("Apple からメールが取得できませんでした。");
  }

  const allowed = await checkAllowedOrAdmin(email);
  if (!allowed) {
    await signOut(auth);
    throw new Error("このメールアドレスではログインできません。");
  }

  // users が無ければ詳細を保存（Googleと同じ）
  if (!snap.exists()) {
    await setDoc(userRef, {
      email,
      name: user.displayName ?? "",
      provider: "apple",
      createdAt: serverTimestamp(),
    });
  }
}
