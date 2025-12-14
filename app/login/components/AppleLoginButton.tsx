"use client";

import { OAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { checkAllowedOrAdmin } from "../lib/authGate";

export default function AppleLoginButton({
  onError,
  onSuccess,
  className,
}: {
  onError: (msg: string) => void;
  onSuccess: () => void;
  className?: string;
}) {
  async function handleAppleLogin() {
    onError("");
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");

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

      // Apple は2回目以降 email が空になることがある → 弾く方針のまま
      if (!email) {
        await user.delete();
        onError("Apple からメールを取得できませんでした。");
        return;
      }

      const allowed = await checkAllowedOrAdmin(email);
      if (!allowed) {
        await user.delete();
        onError("このメールアドレスではログインできません。");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          email,
          name: user.displayName ?? "",
          provider: "apple",
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
        onError("Appleログインに失敗しました");
      }
    }
  }

  return (
    <button type="button" onClick={handleAppleLogin} className={className}>
      Appleでログイン
    </button>
  );
}
