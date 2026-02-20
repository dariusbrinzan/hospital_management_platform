"use client";

import { useState, useMemo, useRef } from "react";
import {
  HOSPITAL_FLOORS,
  BUILDING_DIMENSIONS,
  searchRooms,
  type Room,
  type RoomCategory,
  type FloorPlan,
  type Corridor,
} from "@/lib/hospital-map";

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

const CAT_LABEL: Record<RoomCategory, string> = {
  reception: "Recepție",
  emergency: "Urgențe",
  imaging: "Imagistică",
  lab: "Laborator",
  consultation: "Cabinet",
  icu: "ATI",
  pharmacy: "Farmacie",
  cafeteria: "Cafeteria",
  restroom: "Toalete",
  elevator: "Lift",
  stairs: "Scări",
  ward: "Salon",
  utility: "Tehnic",
  waiting: "Așteptare",
  nurses: "Post medical",
  office: "Birou",
};

export function HospitalMap() {
  const [floor, setFloor] = useState(0);
  const [selected, setSelected] = useState<Room | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const plan = HOSPITAL_FLOORS.find((f) => f.number === floor) || HOSPITAL_FLOORS[0];
  const { w: BW, h: BH } = BUILDING_DIMENSIONS;

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchRooms(query.trim());
  }, [query]);

  const selectRoom = (room: Room) => {
    setSelected(room);
    setFloor(room.floor);
    setQuery("");
  };

  const doorIndicator = (room: Room) => {
    const ds = room.doorSide || "bottom";
    const dw = Math.min(Math.max(room.w * 0.28, 14), 22);
    const dh = 5;
    let dx = 0, dy = 0, rw = dw, rh = dh;
    if (ds === "bottom") { dx = room.x + (room.w - dw) / 2; dy = room.y + room.h - 2; }
    else if (ds === "top") { dx = room.x + (room.w - dw) / 2; dy = room.y - 2; }
    else if (ds === "left") { dx = room.x - 1; dy = room.y + (room.h - dw) / 2; rw = dh; rh = dw; }
    else { dx = room.x + room.w - 1; dy = room.y + (room.h - dw) / 2; rw = dh; rh = dw; }
    return { dx, dy, rw, rh };
  };

  return (
    <div className="space-y-4">
      {/* Căutare globală */}
      <div className="relative rounded-xl border border-dark-200 bg-white p-4 shadow-sm">
        <label className="mb-1.5 block text-sm font-medium text-dark-700">
          Caută cabinet, doctor, secție...
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Dr. Popescu, C101, Cardiologie, Urgențe..."
          className="w-full rounded-lg border border-dark-200 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        {query.trim() && searchResults.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-dark-200 bg-white shadow-xl">
            {searchResults.slice(0, 12).map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => selectRoom(r)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-green-50"
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: CAT_STROKE[r.category] }}
                  >
                    {r.roomNumber.slice(0, 3)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-700 truncate">{r.name}</p>
                    <p className="text-xs text-dark-500">
                      {r.doctor && <span className="font-medium text-green-700">{r.doctor} · </span>}
                      Etaj {r.floor} · {r.roomNumber}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && searchResults.length === 0 && (
          <p className="mt-2 text-xs text-dark-500">Niciun rezultat găsit.</p>
        )}
      </div>

      {/* Selector etaje - tabs stil blueprint */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-dark-200 bg-white p-1.5 shadow-sm">
        {HOSPITAL_FLOORS.map((f) => (
          <button
            key={f.number}
            onClick={() => { setFloor(f.number); setSelected(null); }}
            className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              floor === f.number
                ? "bg-green-500 text-white shadow-sm"
                : "text-dark-600 hover:bg-gray-100"
            }`}
          >
            <span className="font-bold">{f.number === 0 ? "P" : f.number}</span>
            <span className="ml-1.5 hidden sm:inline">{f.name.split("—")[1]?.trim() || f.name}</span>
          </button>
        ))}
      </div>

      {/* Blueprint SVG */}
      <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
        <div className="border-b border-dark-200 px-5 py-3">
          <h2 className="text-base font-semibold text-dark-700">{plan.name}</h2>
          <p className="text-xs text-dark-500">{plan.label}</p>
        </div>
        <div className="relative overflow-auto p-4" style={{ background: "#FAFBFC" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${BW} ${BH}`}
            className="mx-auto block w-full"
            style={{ maxHeight: "600px", minHeight: "420px" }}
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={BW} height={BH} fill="url(#grid)" />

            {/* Building outline — dreptunghi */}
            <rect x="22" y="28" width={BW - 44} height={BH - 56} fill="none" stroke="#374151" strokeWidth="2.5" rx="5" />

            {/* Corridors */}
            {plan.corridors.map((c, i) => (
              <g key={`cor-${i}`}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="6 3" rx="2" />
                {c.label && (
                  <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 4} textAnchor="middle" fontSize="11" fill="#9CA3AF" fontWeight="500" letterSpacing="1">
                    {c.label.toUpperCase()}
                  </text>
                )}
              </g>
            ))}

            {/* Rooms */}
            {plan.rooms.map((room) => {
              const isHov = hovered === room.id;
              const isSel = selected?.id === room.id;
              const fill = CAT_FILL[room.category];
              const stroke = CAT_STROKE[room.category];
              const door = doorIndicator(room);
              const labelFits = room.w >= 80 && room.h >= 50;
              const doctorFits = room.w >= 100 && room.h >= 70 && !!room.doctor;

              return (
                <g
                  key={room.id}
                  className="cursor-pointer"
                  onClick={() => selectRoom(room)}
                  onMouseEnter={() => setHovered(room.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Room fill */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill={isSel ? stroke : isHov ? `${stroke}22` : fill}
                    stroke={stroke}
                    strokeWidth={isSel ? 3 : isHov ? 2 : 1.5}
                    rx="3"
                  />
                  {/* Door indicator */}
                  <rect
                    x={door.dx}
                    y={door.dy}
                    width={door.rw}
                    height={door.rh}
                    fill="#FCD34D"
                    rx="1"
                  />
                  {/* Room number (always visible) */}
                  <text
                    x={room.x + 6}
                    y={room.y + 14}
                    fontSize="10"
                    fontWeight="700"
                    fill={isSel ? "#FFFFFF" : stroke}
                    className="pointer-events-none select-none"
                  >
                    {room.roomNumber}
                  </text>
                  {/* Room name */}
                  {labelFits && (
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 + (doctorFits ? -4 : 2)}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={isSel ? "#FFFFFF" : "#374151"}
                      className="pointer-events-none select-none"
                    >
                      {room.name.length > 20 ? room.name.slice(0, 18) + "…" : room.name}
                    </text>
                  )}
                  {/* Doctor name */}
                  {doctorFits && (
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 + 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isSel ? "#D1FAE5" : "#059669"}
                      fontWeight="500"
                      className="pointer-events-none select-none"
                    >
                      {room.doctor}
                    </text>
                  )}
                  {/* Small rooms: just icon text */}
                  {!labelFits && (
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 + 5}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isSel ? "#FFFFFF" : "#374151"}
                      className="pointer-events-none select-none"
                    >
                      {room.category === "elevator" ? "▲▼" : room.category === "stairs" ? "╱╲" : room.category === "restroom" ? "WC" : ""}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Title */}
            <text x={BW / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill="#374151">
              {plan.name}
            </text>
            <text x={BW - 30} y={BH - 10} textAnchor="end" fontSize="9" fill="#9CA3AF">
              Spital eHealth.ro — Plan etaj
            </text>
          </svg>
        </div>

        {/* Legendă */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-dark-200 px-5 py-3">
          {(Object.keys(CAT_FILL) as RoomCategory[])
            .filter((cat) => plan.rooms.some((r) => r.category === cat))
            .map((cat) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border" style={{ background: CAT_FILL[cat], borderColor: CAT_STROKE[cat] }} />
                <span className="text-xs text-dark-600">{CAT_LABEL[cat]}</span>
              </div>
            ))}
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "#FCD34D" }} />
            <span className="text-xs text-dark-600">Ușă</span>
          </div>
        </div>
      </div>

      {/* Panel detalii */}
      {selected && (
        <div className="rounded-xl border border-dark-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: CAT_STROKE[selected.category] }}
                >
                  {selected.roomNumber.slice(0, 3)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-dark-700">
                    {selected.roomNumber} — {selected.name}
                  </h3>
                  <p className="text-xs text-dark-500">
                    {CAT_LABEL[selected.category]} · {HOSPITAL_FLOORS[selected.floor]?.name}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-dark-400 hover:bg-gray-100 hover:text-dark-600" aria-label="Închide">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {selected.doctor && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
              <span className="text-sm font-semibold text-green-700">{selected.doctor}</span>
              {selected.specialty && <span className="text-xs text-green-600">· {selected.specialty}</span>}
            </div>
          )}

          <p className="mb-4 text-sm text-dark-600 leading-relaxed">{selected.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {selected.hours && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs font-medium text-dark-500">Program</p>
                <p className="text-sm text-dark-700">{selected.hours}</p>
              </div>
            )}
            {selected.phone && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs font-medium text-dark-500">Telefon</p>
                <p className="text-sm text-dark-700">{selected.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
