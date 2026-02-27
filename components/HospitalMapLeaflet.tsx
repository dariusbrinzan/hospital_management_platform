"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Rectangle, Popup, Tooltip, useMap, LayerGroup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Room, RoomCategory, FloorPlan } from "@/lib/hospital-map";

const CAT_FILL: Record<RoomCategory, string> = {
  reception: "#D1FAE5",
  emergency: "#FEE2E2",
  imaging: "#CFFAFE",
  lab: "#EDE9FE",
  consultation: "#CCFBF1",
  icu: "#FFE4E6",
  pharmacy: "#D1FAE5",
  cafeteria: "#FEF3C7",
  restroom: "#E0E7FF",
  elevator: "#F1F5F9",
  stairs: "#F1F5F9",
  ward: "#FEF9C3",
  utility: "#F3F4F6",
  waiting: "#F0FDF4",
  nurses: "#FCE7F3",
  office: "#EFF6FF",
};

const CAT_STROKE: Record<RoomCategory, string> = {
  reception: "#059669",
  emergency: "#DC2626",
  imaging: "#0891B2",
  lab: "#7C3AED",
  consultation: "#0D9488",
  icu: "#BE123C",
  pharmacy: "#059669",
  cafeteria: "#D97706",
  restroom: "#4F46E5",
  elevator: "#64748B",
  stairs: "#64748B",
  ward: "#CA8A04",
  utility: "#6B7280",
  waiting: "#16A34A",
  nurses: "#DB2777",
  office: "#2563EB",
};

type HospitalMapLeafletProps = {
  plan: FloorPlan;
  selectedId: string | null;
  highlightRoomId: string | null;
  onSelectRoom: (room: Room) => void;
  selectedRoom: Room | null;
  buildingW: number;
  buildingH: number;
};

function FlyToRoom({ room }: { room: Room | null }) {
  const map = useMap();
  useEffect(() => {
    if (!room) return;
    const center: [number, number] = [room.y + room.h / 2, room.x + room.w / 2];
    map.flyTo(center, 1, { duration: 0.4 });
  }, [room?.id, map]);
  return null;
}

function RoomPopupContent({ room }: { room: Room }) {
  return (
    <div className="min-w-[200px] text-left">
      <div className="font-semibold text-gray-900">
        {room.roomNumber} — {room.name}
      </div>
      {room.doctor && (
        <p className="mt-1 text-sm text-green-700">
          {room.doctor}
          {room.specialty && ` · ${room.specialty}`}
        </p>
      )}
      <p className="mt-1 text-sm text-gray-600">{room.description}</p>
      {room.hours && (
        <p className="mt-1 text-xs text-gray-500">
          <span className="font-medium">Program:</span> {room.hours}
        </p>
      )}
      {room.phone && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">Telefon:</span> {room.phone}
        </p>
      )}
    </div>
  );
}

function roomLabelHtml(room: Room, isSelected: boolean, stroke: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const num = esc(room.roomNumber);
  const name = esc(room.name.slice(0, 14));
  const small = room.w < 70 || room.h < 40;
  const icon =
    room.category === "elevator" ? "▲▼" : room.category === "stairs" ? "╱╲" : room.category === "restroom" ? "WC" : "";
  if (small) {
    return `<div class="room-label room-label--small" style="color:${stroke};font-weight:700">${icon || num}</div>`;
  }
  return `<div class="room-label" style="color:${isSelected ? "#fff" : stroke}"><span class="room-label__num">${num}</span><span class="room-label__name">${name}${room.name.length > 14 ? "…" : ""}</span></div>`;
}

function createRoomLabelIcon(room: Room, isSelected: boolean, stroke: string, w: number, h: number): L.DivIcon {
  return L.divIcon({
    html: roomLabelHtml(room, isSelected, stroke),
    className: "room-label-icon",
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
  });
}

function createCorridorLabelIcon(label: string): L.DivIcon {
  return L.divIcon({
    html: `<div class="corridor-label">${label.replace(/&/g, "&amp;")}</div>`,
    className: "corridor-label-icon",
    iconSize: [120, 24],
    iconAnchor: [60, 12],
  });
}

export function HospitalMapLeaflet({
  plan,
  selectedId,
  highlightRoomId,
  onSelectRoom,
  selectedRoom,
  buildingW,
  buildingH,
}: HospitalMapLeafletProps) {
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [buildingH, buildingW],
  ];
  const center: [number, number] = [buildingH / 2, buildingW / 2];

  return (
    <div className="hospital-map-wrapper relative h-[520px] w-full overflow-hidden rounded-lg border border-gray-200 bg-[#FAFBFC]">
      <div className="absolute bottom-2 right-2 z-[1000] rounded bg-white/90 px-2 py-1 text-[10px] text-gray-500 shadow-sm">
        Spital eHealth · Plan etaj
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .room-label-icon, .corridor-label-icon { background: transparent !important; border: none !important; pointer-events: none !important; }
        .room-label { font-size: 10px; text-align: center; line-height: 1.2; font-weight: 600; text-shadow: 0 0 2px rgba(255,255,255,0.9), 0 1px 1px rgba(0,0,0,0.1); }
        .room-label--small { font-size: 9px; }
        .room-label__num { display: block; font-weight: 700; }
        .room-label__name { display: block; font-size: 9px; opacity: 0.95; }
        .corridor-label { font-size: 10px; letter-spacing: 0.08em; color: #6b7280; font-weight: 600; text-transform: uppercase; }
      `}} />
      <MapContainer
        center={center}
        zoom={0}
        minZoom={-1.5}
        maxZoom={2}
        crs={L.CRS.Simple}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <FlyToRoom room={selectedRoom} />
        <LayerGroup>
          {/* Contur clădire */}
          <Rectangle
            bounds={[
              [0, 0],
              [buildingH, buildingW],
            ]}
            pathOptions={{
              fillColor: "transparent",
              fillOpacity: 0,
              color: "#374151",
              weight: 2.5,
            }}
          />
          {/* Corridors */}
          {plan.corridors.map((c, i) => (
            <Rectangle
              key={`cor-${i}`}
              bounds={[
                [c.y, c.x],
                [c.y + c.h, c.x + c.w],
              ]}
              pathOptions={{
                fillColor: "#F9FAFB",
                fillOpacity: 1,
                color: "#D1D5DB",
                weight: 1,
                dashArray: "6 3",
              }}
            />
          ))}
          {/* Etichete coridoare */}
          {plan.corridors.map(
            (c, i) =>
              c.label && (
                <Marker
                  key={`cor-label-${i}`}
                  position={[c.y + c.h / 2, c.x + c.w / 2]}
                  icon={createCorridorLabelIcon(c.label)}
                  zIndexOffset={0}
                />
              )
          )}
          {/* Rooms */}
          {plan.rooms.map((room) => {
            const isSelected = selectedId === room.id;
            const isHighlight = highlightRoomId === room.id;
            const fill = CAT_FILL[room.category];
            const stroke = CAT_STROKE[room.category];
            return (
              <Rectangle
                key={room.id}
                bounds={[
                  [room.y, room.x],
                  [room.y + room.h, room.x + room.w],
                ]}
                pathOptions={{
                  fillColor: isSelected || isHighlight ? stroke : fill,
                  fillOpacity: isSelected || isHighlight ? 0.85 : 1,
                  color: stroke,
                  weight: isSelected || isHighlight ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectRoom(room),
                }}
              >
                <Tooltip direction="top" opacity={0.95} permanent={false}>
                  <span className="font-semibold">{room.roomNumber}</span>
                  {room.name.length <= 25 ? ` — ${room.name}` : ` — ${room.name.slice(0, 22)}…`}
                  {room.doctor && (
                    <span className="block text-xs text-green-700">{room.doctor}</span>
                  )}
                </Tooltip>
                <Popup>
                  <RoomPopupContent room={room} />
                </Popup>
              </Rectangle>
            );
          })}
          {/* Etichete camere (peste rect-uri, nu captează click) */}
          {plan.rooms.map((room) => {
            const isSelected = selectedId === room.id;
            const stroke = CAT_STROKE[room.category];
            const center: [number, number] = [room.y + room.h / 2, room.x + room.w / 2];
            return (
              <Marker
                key={`label-${room.id}`}
                position={center}
                icon={createRoomLabelIcon(room, isSelected, stroke, room.w, room.h)}
                zIndexOffset={10}
              />
            );
          })}
        </LayerGroup>
      </MapContainer>
    </div>
  );
}
