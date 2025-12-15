import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { checkAllowedOrAdmin } from "../lib/authGate";
import { useState } from "react";
import { useRouter } from "next/navigation";


export async function handleSubmit(e: React.FormEvent) {
  	const [error, setError] = useState("");
  	const router = useRouter();
  	const [email, setEmail] = useState("");
  	const [password, setPassword] = useState("");

  	e.preventDefault();
  	setError("");
  	try {
	const result = await signInWithEmailAndPassword(auth, email, password);
	// 🔐 authGate（ここ）
	const loginEmail = result.user.email?.toLowerCase() ?? "";
	if (!loginEmail) {
	  await auth.signOut();
	  setError("メールアドレスを取得できませんでした。");
	  return;
	}
	const allowed = await checkAllowedOrAdmin(loginEmail);
	if (!allowed) {
	  await auth.signOut();
	  setError("このメールアドレスではログインできません。");
	  return;
	}
	// 通過したら遷移
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
