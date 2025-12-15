"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { isEmailAllowed } from "@/lib/authRules";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "ttnetnzua@gmail.com").toLowerCase();

export async function signupWithEmailPassword(args: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const { email, password, confirmPassword } = args;

  if (password !== confirmPassword) {
    throw new Error("パスワードが一致しません");
  }

  const normalized = email.trim().toLowerCase();

  let allowed = false;
  if (normalized === ADMIN_EMAIL) {
    allowed = true;
  } else {
    allowed = await isEmailAllowed(normalized);
  }

  if (!allowed) {
    throw new Error("このメールアドレスでは現在登録できません。下の許可申請フォームから申請できます。");
  }
try {
  const cred = await createUserWithEmailAndPassword(auth, normalized, password);
    const user = cred.user;

  await setDoc(doc(db, "users", user.uid), {
    email: normalized,
    createdAt: serverTimestamp(),
  });
} catch (e: any) {
  console.warn("signup error:", e?.code, e?.message);
  if (e?.code === "auth/email-already-in-use") throw new Error("このメールアドレスは既に登録されています。");
  if (e?.code === "auth/invalid-email") throw new Error("メールアドレスの形式が正しくありません。");
  if (e?.code === "auth/weak-password") throw new Error("パスワードが弱すぎます（6文字以上など）。");
  if (e?.code === "auth/operation-not-allowed") throw new Error("メール/パスワード認証が無効です（Firebase Consoleで有効化して）。");

  throw new Error("アカウント作成に失敗しました");
}

}
