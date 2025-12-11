// app/harvests/page.tsx
// ニュース一覧っぽく「とれた獲物」を並べるページ

export default async function HarvestsPage() {
  // 実際は Firestore などから fetch する
  const dummy = [
    {
      id: "",
      title: "",
      date: "",
      summary: "",
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8"style={{background : "#ffffff", }}>
      <h1 className="text-2xl font-bold mb-4"style={{color : "#000000"}}>とれた獲物の記録・ニュース</h1>
      <p className="text-sm text-gray-600 mb-6" style={{color : "#000000"}}>
        捕獲日や部位、写真などの情報をニュース形式で掲載しています。
      </p>

      <ul className="space-y-4">
        {dummy.map((item) => (
          <li key={item.id} className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1"style={{color : "#000000"}}>{item.date}</p>
            <p className="text-lg font-semibold"style={{color : "#000000"}}>
              {item.title}
            </p>
            <p className="text-sm text-gray-700 mt-1"style={{color : "#000000"}}>{item.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
