"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import L from "leaflet";

// Leafletのデフォルトアイコンの問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Status = "active" | "inactive" | "hit" | "removed";

export type Trap = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: Status;
  note?: string;
};

function iconOf(status: Status) {
  const color =
    status === "active"
      ? "#ef4444"  // 緑：稼働
      : status === "inactive"
      ? "#a3a3a3"   // グレー：停止
      : status === "hit"
      ? "#22c55e"   // 赤：捕獲
      : "#3b82f6";  // 青：撤去

  return new L.DivIcon({
    className: "", // Leaflet のデフォルトCSSを消す
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(0,0,0,0.6);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function labelOfStatus(s: Status) {
  switch (s) {
    case "active":
      return "稼働";
    case "inactive":
      return "停止";
    case "hit":
      return "捕獲";
    case "removed":
      return "撤去";
  }
}

// 奥多摩中心（だいたい）
const OKUTAMA_CENTER: LatLngExpression = [35.80, 139.10];

// 奥多摩＋少し余裕（ドラッグ制限）
const OKUTAMA_BOUNDS: LatLngBoundsExpression = [
  [35.70, 139.00],
  [35.90, 139.25],
];

export default function TrapMapClient({
  traps,
  onPick,
  onChangeStatus,
}: {
  traps: Trap[];
  onPick?: (p: { lat: number; lng: number }) => void;
  onChangeStatus?: (id: string, next: Status) => void;
}) {
  return (
    <MapContainer
      center={OKUTAMA_CENTER}
      zoom={13}
      minZoom={12}
      maxZoom={17}
      maxBounds={OKUTAMA_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {traps.map((t) => (
        <Marker key={t.id} position={[t.lat, t.lng]} icon={iconOf(t.status)}>
          <Popup>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
              </div>
              {t.note && <div style={{ marginTop: 6 }}>{t.note}</div>}
              <div style={{ marginTop: 6, fontSize: 12}}>
                状態：{labelOfStatus(t.status)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
