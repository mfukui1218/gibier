// lib/saveUserProfile.ts
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function saveUserProfile(
  name: string,
  relationship: string
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("未ログイン");
  }

  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
      name,
      relationship,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}
