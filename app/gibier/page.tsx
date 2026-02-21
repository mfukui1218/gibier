"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./gibier.module.css";

type MeatPart = {
  id: string;
  name: string;
  animal: string;
  description: string;
  imageUrl: string;
};

export default function GibierPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [parts, setParts] = useState<MeatPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);

  // 未ログインなら /login
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // プロフィール取得
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data?.name) setProfileName(data.name);
        }
      } catch (e) {
        console.error("profile load error", e);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) loadProfile();
  }, [user]);

  // 部位一覧取得
  useEffect(() => {
    const loadParts = async () => {
      if (!user) return;
      setPartsLoading(true);
      try {
        const snap = await getDocs(collection(db, "parts"));
        const nextParts: MeatPart[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data?.name ?? "",
            animal: data?.animal ?? "",
            description: data?.description ?? "",
            imageUrl: data?.imageUrl ?? "",
          };
        });

        nextParts.sort((a, b) =>
          `${a.animal}${a.name}`.localeCompare(`${b.animal}${b.name}`, "ja")
        );

        setParts(nextParts);
      } catch (e) {
        console.error("parts load error", e);
      } finally {
        setPartsLoading(false);
      }
    };

    if (user) loadParts();
  }, [user]);

  // 認証状態の判定中
  if (user === undefined) {
    return <main className={styles.loading}>読み込み中...</main>;
  }
  if (user === null) return null;

  const displayName = profileLoading ? "読み込み中..." : profileName ?? user.email;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>ジビエ部位一覧</h1>
          <p className={styles.subtitle}>{displayName} でログイン中</p>
        </header>

        {partsLoading ? (
          <p style={{ fontSize: 14 }}>部位を読み込み中...</p>
        ) : parts.length === 0 ? (
          <p style={{ fontSize: 14 }}>登録されている部位がありません。</p>
        ) : (
          <div className={styles.partsGrid}>
            {parts.map((part) => (
              <button
                key={part.id}
                type="button"
                className={styles.cardButton}
                onClick={() => router.push(`/parts/${part.id}`)}
              >
                <div className={styles.thumb}>
                  <img
                    src={part.imageUrl || "/images/placeholder.png"}
                    alt={`${part.animal} ${part.name}`}
                    className={styles.thumbImg}
                  />
                </div>

                <div>
                  <div className={styles.animal}>{part.animal}</div>
                  <div className={styles.partName}>{part.name}</div>
                  <div className={styles.desc}>{part.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className={styles.bottomNav}>
          <button
            type="button"
            className={styles.dashButton}
            onClick={() => router.push("/home")}
          >
            HOMEへ
          </button>
        </div>
      </div>
    </main>
  );
}
