/* public/firebase-messaging-sw.js */

// ⚠️ ここは “Firebase コンソールの Web app設定” の値を入れる
const firebaseConfig = {
  apiKey: "AIzaSyDuKxzhGOsNpu0SH4in0Auh8DoFkYEL23c",
  authDomain: "management-gibier.firebaseapp.com",
  projectId: "management-gibier",
  storageBucket: "management-gibier.firebasestorage.app",
  messagingSenderId: "848982630110",
  appId: "1:848982630110:web:53833a5d0f813ee41fac4f",
};
// Firebase v9 compat を SW で使う（SW ではこの形が楽）
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// バックグラウンド通知（アプリ開いてない/別タブ等）を受ける
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "通知";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, options);
});

// 通知クリック時に開く（任意）
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/admin/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // 既に開いてるタブがあればそこへフォーカス
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      // なければ新しく開く
      return clients.openWindow(url);
    })
  );
});
