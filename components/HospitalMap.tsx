"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import {
  HOSPITAL_FLOORS,
  BUILDING_DIMENSIONS,
  searchRooms,
  getAllRooms,
  type Room,
  type RoomCategory,
} from "@/lib/hospital-map";

const HospitalMapLeaflet = dynamic(
  () => import("./HospitalMapLeaflet").then((m) => m.HospitalMapLeaflet),
  { ssr: false }
);

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

type HospitalMapProps = {
  /** Etaj la care să se deschidă harta (ex. din link programare). */
  initialFloor?: number;
  /** Id-ul camerei de evidențiat (ex. cabinet programare). */
  highlightRoomId?: string;
  /** Căutare precompletată (ex. nume doctor din programare). */
  initialSearch?: string;
};

export function HospitalMap({ initialFloor, highlightRoomId, initialSearch }: HospitalMapProps) {
  const [floor, setFloor] = useState(initialFloor ?? 0);
  const [selected, setSelected] = useState<Room | null>(null);
  const [query, setQuery] = useState(initialSearch ?? "");
  const [fromAppointment, setFromAppointment] = useState<Room | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<RoomCategory | null>(null);

  useEffect(() => {
    if (highlightRoomId == null || highlightRoomId === "") return;
    const room = getAllRooms().find((r) => r.id === highlightRoomId) ?? null;
    if (room) {
      setFloor(room.floor);
      setSelected(room);
      setFromAppointment(room);
    }
  }, [highlightRoomId]);

  useEffect(() => {
    if (initialFloor != null && Number.isInteger(initialFloor)) {
      setFloor(initialFloor);
    }
  }, [initialFloor]);

  useEffect(() => {
    if (initialSearch != null && initialSearch !== "") {
      setQuery(initialSearch);
    }
  }, [initialSearch]);

  const plan = HOSPITAL_FLOORS.find((f) => f.number === floor) || HOSPITAL_FLOORS[0];

  const floorStats = useMemo(() => {
    const byCat: Partial<Record<RoomCategory, number>> = {};
    plan.rooms.forEach((r) => {
      byCat[r.category] = (byCat[r.category] ?? 0) + 1;
    });
    const parts: string[] = [];
    (Object.keys(CAT_LABEL) as RoomCategory[]).forEach((cat) => {
      const n = byCat[cat];
      if (n && n > 0) parts.push(n > 1 ? `${n} ${CAT_LABEL[cat]}` : CAT_LABEL[cat]);
    });
    return parts.join(" · ");
  }, [plan.rooms]);

  const roomsFiltered = useMemo(() => {
    if (!categoryFilter) return plan.rooms;
    return plan.rooms.filter((r) => r.category === categoryFilter);
  }, [plan.rooms, categoryFilter]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchRooms(query.trim());
  }, [query]);

  const selectRoom = (room: Room) => {
    setSelected(room);
    setFloor(room.floor);
    setQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Banner programare: cabinet și etaj */}
      {fromAppointment && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Programare:</span> cabinet{" "}
            <span className="font-mono font-semibold">{fromAppointment.roomNumber}</span>
            {fromAppointment.doctor && <> — {fromAppointment.doctor}</>}, Etaj {fromAppointment.floor}.
          </p>
          <button
            type="button"
            onClick={() => setFromAppointment(null)}
            className="flex-shrink-0 rounded-lg p-1.5 text-green-600 hover:bg-green-100"
            aria-label="Închide"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

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

      {/* Harta interactivă (Leaflet) */}
      <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
        <div className="border-b border-dark-200 px-5 py-3">
          <h2 className="text-base font-semibold text-dark-700">{plan.name}</h2>
          <p className="text-xs text-dark-500">{plan.label}</p>
          <p className="mt-1.5 text-xs text-dark-600">
            <span className="font-medium">Pe acest etaj:</span> {floorStats}
          </p>
          <p className="mt-0.5 text-xs text-dark-400">
            Plan interactiv · Zoom cu scroll, deplasare cu mouse · Click pe cameră pentru detalii
          </p>
        </div>
        <div className="p-4">
          <HospitalMapLeaflet
            plan={plan}
            selectedId={selected?.id ?? null}
            highlightRoomId={highlightRoomId ?? null}
            onSelectRoom={selectRoom}
            selectedRoom={selected}
            buildingW={BUILDING_DIMENSIONS.w}
            buildingH={BUILDING_DIMENSIONS.h}
          />
        </div>

        {/* Legendă + Filtru categorii (click pe categorie filtrează lista) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dark-200 px-5 py-3">
          <span className="text-xs font-medium text-dark-500">Legendă / Filtru:</span>
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${categoryFilter === null ? "bg-dark-200 text-dark-800" : "text-dark-500 hover:bg-gray-100"}`}
          >
            Toate
          </button>
          {(Object.keys(CAT_FILL) as RoomCategory[])
            .filter((cat) => plan.rooms.some((r) => r.category === cat))
            .map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter((prev) => (prev === cat ? null : cat))}
                className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-colors ${
                  categoryFilter === cat ? "ring-1 ring-offset-1" : "hover:bg-gray-100"
                }`}
                style={
                  categoryFilter === cat
                    ? { background: CAT_FILL[cat], borderColor: CAT_STROKE[cat], ringColor: CAT_STROKE[cat] }
                    : undefined
                }
              >
                <span className="inline-block h-2.5 w-2.5 rounded-sm border" style={{ background: CAT_FILL[cat], borderColor: CAT_STROKE[cat] }} />
                <span className="text-dark-600">{CAT_LABEL[cat]}</span>
              </button>
            ))}
        </div>

        {/* Listă camere pe etaj — click pentru a localiza pe hartă */}
        <div className="border-t border-dark-200 px-5 py-3">
          <p className="mb-2 text-xs font-medium text-dark-500">
            Camere pe acest etaj {categoryFilter ? `(filtru: ${CAT_LABEL[categoryFilter]})` : ""} — click pentru a localiza
          </p>
          <div className="flex flex-wrap gap-1.5">
            {roomsFiltered.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => selectRoom(room)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  selected?.id === room.id ? "text-white shadow-sm" : "bg-gray-100 text-dark-700 hover:bg-gray-200"
                }`}
                style={selected?.id === room.id ? { background: CAT_STROKE[room.category] } : undefined}
              >
                <span className="font-mono font-semibold">{room.roomNumber}</span>
                <span className="max-w-[120px] truncate">{room.name}</span>
                {room.doctor && <span className="hidden sm:inline text-dark-500">· {room.doctor.split(" ").slice(-1)[0]}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Contacte utile (parter) */}
        {floor === 0 && (
          <div className="border-t border-dark-200 bg-gray-50/80 px-5 py-2.5">
            <p className="text-xs font-medium text-dark-600">
              Contacte utile: Recepție ext. 100 · Urgențe 24/7 ext. 111 · Farmacie ext. 201
            </p>
          </div>
        )}
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
