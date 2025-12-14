"use client";

import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { checkAllowedOrAdmin } from "../lib/authGate";

export default function GoogleLoginButton({
  onError,
  onSuccess,
  className,
}: {
  onError: (msg: string) => void;
  onSuccess: () => void;
  className?: string;
}) {
  async function handleGoogleLogin() {
    onError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const email = user.email?.toLowerCase() ?? "";
      const info = getAdditionalUserInfo(result);

      // 初回ログインのときだけ users を作成（最低限）
      if (info?.isNewUser) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email ?? null,
          createdAt: serverTimestamp(),
        });
      }

      if (!email) {
        await user.delete();
        onError("Google からメールが取得できませんでした。");
        return;
      }

      // allowed チェック
      const allowed = await checkAllowedOrAdmin(email);
      if (!allowed) {
        await user.delete();
        onError("このメールアドレスではログインできません。");
        return;
      }

      // users 初回保存（すでにあるなら触らない）
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

      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/popup-closed-by-user") return;

      if (err?.code === "auth/account-exists-with-different-credential") {
        onError("別の方法で登録済みです。メールアドレスでログインしてください。");
      } else {
        onError("Googleログインに失敗しました");
      }
    }
  }

  return (
    <button type="button" onClick={handleGoogleLogin} className={className}>
      Googleでログイン
    </button>
  );
}
