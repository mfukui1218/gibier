"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type Harvest = {
  id: string;
  title: string;
  summary: string;
  date?: any;
  imageUrl?: string;
};

export default function HarvestsPage() {
  const [items, setItems] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "harvests"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: Harvest[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setItems(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8" style={{ background: "#ffffff" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#000000" }}>
        とれた獲物の記録・ニュース
      </h1>
      <p className="text-sm mb-6" style={{ color: "#000000" }}>
        捕獲日や部位、写真などの情報をニュース形式で掲載しています。
      </p>

      {loading ? (
        <p style={{ color: "#000" }}>読み込み中...</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs mb-1" style={{ color: "#000000" }}>
                {item.date?.toDate?.()
                  ? item.date.toDate().toLocaleDateString("ja-JP")
                  : ""}
              </p>

              <div className="flex gap-4 items-start">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-24 w-36 rounded border border-gray-200 object-cover"
                  />
                ) : null}

                <div>
                  <p className="text-lg font-semibold" style={{ color: "#000000" }}>
                    {item.title}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#000000" }}>
                    {item.summary}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
