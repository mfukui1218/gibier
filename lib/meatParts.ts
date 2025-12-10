export type MeatPart = {
  id: string;
  name: string;
  animal: string;
  description: string;
  imageSrc: string;

  // ★ 追加
  price?: string;   // 例: "1,800円 / 100g"
  stock?: number;   // 例: 3（= 3個在庫）
};

export const MEAT_PARTS: MeatPart[] = [
  {
    id: "deer-loin",
    name: "ロース",
    animal: "シカ",
    description: "ステーキやロースト向きのやわらかい部位。",
    imageSrc: "/images/deer-loin.png",
  },
  {
    id: "deer-thigh",
    name: "モモ",
    animal: "シカ",
    description: "脂が少なく赤身しっかり。焼き・煮込みどちらも可。",
    imageSrc: "/images/deer-thigh.png",
  },
  {
    id: "deer-liver",
    name: "レバー（肝）",
    animal: "シカ",
    description: "鉄分たっぷり。焼き・炒め物に向く。鮮度管理が重要。",
    imageSrc: "/images/deer-liver.png",
  },
  {
    id: "deer-heart",
    name: "ハツ（心臓）",
    animal: "シカ",
    description: "歯ごたえが良く、クセが少ない。焼肉・炒め物に最適。",
    imageSrc: "/images/deer-heart.png",
  },
  {
    id: "duck-magamo",
    name: "マガモ",
    animal: "マガモ",
    description: "鉄分豊富で旨味が強い。ロースト・鍋・燻製に向く。",
    imageSrc: "/images/duck-magamo.png",
  },
  {
    id: "anaguma",
    name: "アナグマ",
    animal: "アナグマ",
    description: "脂が非常に甘く、煮込み・シチューに向く希少肉。",
    imageSrc: "/images/anaguma.png",
  },
  {
    id: "boar-belly",
    name: "バラ",
    animal: "イノシシ",
    description: "脂しっかり。焼肉・角煮・シチューに向く。",
    imageSrc: "/images/boar-belly.png",
  },
  {
    id: "boar-shoulder",
    name: "肩ロース",
    animal: "イノシシ",
    description: "脂と赤身のバランスが良い万能部位。",
    imageSrc: "/images/boar-shoulder.png",
  },
];
