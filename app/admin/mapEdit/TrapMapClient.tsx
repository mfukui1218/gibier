"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useState } from "react";

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
const pickIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 14px;
      height: 14px;
      background: #000000;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0,0,0,0.6);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function ClickPicker({
  onPick,
  setPicked,
}: {
  onPick: (p: { lat: number; lng: number }) => void;
  setPicked: (p: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      const p = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPicked(p);   // ✅ 仮ピン更新
      onPick(p);      // ✅ 親にも通知
    },
  });
  return null;
}

// 奥多摩固定
const OKUTAMA_CENTER: LatLngExpression = [35.80, 139.10];

export default function TrapMapClient({
  traps,
  onPick,
  onChangeStatus,
  center,
}: {
  center?: { lat: number; lng: number };
  traps: Trap[];
  onPick: (p: { lat: number; lng: number }) => void;
  onChangeStatus: (id: string, next: Status) => void;
}) {
  const c: LatLngExpression = center ? [center.lat, center.lng] : OKUTAMA_CENTER;

  // ✅ クリックした場所（仮ピン）
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <MapContainer center={c} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClickPicker onPick={onPick} setPicked={setPicked} />

      {/* ✅ クリックした場所に印（仮ピン） */}
      {picked && (
        <Marker position={[picked.lat, picked.lng]} icon={pickIcon}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700 }}>追加予定の位置</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* 既存トラップ */}
      {traps.map((t) => (
        <Marker key={t.id} position={[t.lat, t.lng]} icon={iconOf(t.status)}>
          <Popup>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
              </div>
              {t.note ? <div style={{ marginTop: 6 }}>{t.note}</div> : null}

              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>状態</span>
                <select
                  value={t.status}
                  onChange={(e) => onChangeStatus(t.id, e.target.value as Status)}
                >
                  <option value="active">稼働</option>
                  <option value="inactive">停止</option>
                  <option value="hit">捕獲</option>
                  <option value="removed">撤去</option>
                </select>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
