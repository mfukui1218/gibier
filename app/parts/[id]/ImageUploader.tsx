"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ImageUploader({ partId, onUploaded }) {
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `parts/${partId}/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      onUploaded(url); // Firestore に画像URLを保存する処理を親が行う
    } catch (err) {
      console.error(err);
      alert("画像アップロードに失敗しました");
    }
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleUpload}
      style={{ marginTop: 8 }}
    />
  );
}
