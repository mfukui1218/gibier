"use client";

import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ImageUploader({ partId, onUploaded }) {
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `parts/${partId}/${file.name}`);

    try {
      // SDK を使ったアップロード
      const snapshot = await uploadBytes(storageRef, file);

      const url = await getDownloadURL(snapshot.ref);

      // 親コンポーネントに返す
      onUploaded(url);
    } catch (err) {
      console.error(err);
      alert("アップロード失敗しました");
    }
  }

  return (
    <input type="file" accept="image/*" onChange={handleUpload} />
  );
}
