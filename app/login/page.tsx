// app/login/page.tsx
"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth, app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./login.css"; // ★ 追加

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

async function checkAllowedOrAdmin(email: string) {
  const lower = email.toLowerCase();

  if (lower === ADMIN_EMAIL.toLowerCase()) return true;

  const functions = getFunctions(app);
  const checkAllowed = httpsCallable(functions, "checkAllowedEmail");
  const res = await checkAllowed({ email: lower });
  const data = res.data as any;

  return !!data.allowed;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません。");
      } else if (err.code === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (err.code === "auth/wrong-password") {
        setError("パスワードが違います。");
      } else if (err.code === "auth/too-many-requests") {
        setError("試行回数が多すぎます。しばらくしてから再試行してください。");
      } else {
        setError("ログインに失敗しました");
      }
    }
  }

  async function handleGoogleLogin() {
  setError("");
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const email = user.email?.toLowerCase() ?? "";
    const info = getAdditionalUserInfo(result);

    // 初回ログインのときだけ users を作成
    if (info?.isNewUser) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email ?? null,
        createdAt: serverTimestamp(),
      });
    }

    if (!email) {
      await user.delete();
      setError("Google からメールが取得できませんでした。");
      return;
    }

    // ★ allowedEmail チェック（最優先）
    const allowed = await checkAllowedOrAdmin(email);
    if (!allowed) {
      await user.delete(); // Firebase Auth に作られたアカウントを即削除
      setError("このメールアドレスではログインできません。");
      return;
    }

    // ★ allowed 通過 → Firestore に初回登録
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

    router.push("/profile");
  } catch (err: any) {
    console.error(err);
    if (err.code === "auth/popup-closed-by-user") return;

    if (err.code === "auth/account-exists-with-different-credential") {
      setError("別の方法で登録済みです。メールアドレスでログインしてください。");
    } else {
      setError("Googleログインに失敗しました");
    }
  }
}

async function handleAppleLogin() {
  setError("");
  try {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");

    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const email = user.email?.toLowerCase() ?? "";

    // Apple は 2回目以降 email を返さない → この場合も弾く
    const info = getAdditionalUserInfo(result);

    // 初回ログインのときだけ users を作成
    if (info?.isNewUser) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email ?? null,
        createdAt: serverTimestamp(),
      });
    }
    if (!email) {
      await user.delete();
      setError("Apple からメールを取得できませんでした。");
      return;
    }

    // ★ allowedEmail チェック（ここで確実に弾く）
    const allowed = await checkAllowedOrAdmin(email);
    if (!allowed) {
      await user.delete();
      setError("このメールアドレスではログインできません。");
      return;
    }

    // ★ allowed 通過 → Firestore に初回保存
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

    router.push("/profile");
  } catch (err: any) {
    console.error(err);

    if (err.code === "auth/popup-closed-by-user") return;

    if (err.code === "auth/account-exists-with-different-credential") {
      setError("別の方法で登録済みです。メールアドレスでログインしてください。");
    } else {
      setError("Appleログインに失敗しました");
    }
  }
}



  return (
    <main className="login-root">
      <div className="login-card">
        <h1 className="login-title">ログイン</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button type="submit" className="login-button">
            ログイン
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="login-button"
          >
            Googleでログイン
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
            className="login-button"
          >
            Appleでログイン
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="login-button"
          >
            アカウント作成
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
      </div>
    </main>
  );
}
