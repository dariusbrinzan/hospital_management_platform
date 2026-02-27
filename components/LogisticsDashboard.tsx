"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createConsumableRequest,
  updateConsumableRequestStatus,
  createEquipment,
  updateEquipmentStatus,
  createInternalTransport,
  updateInternalTransportStatus,
  updateRoomCleaningStatus,
} from "@/lib/actions/logistics.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

const DEPT_LABELS: Record<string, string> = {
  cardiology: "Cardiologie",
  surgery: "Chirurgie",
  pediatrics: "Pediatrie",
  orthopedics: "Ortopedie",
  neurology: "Neurologie",
  general: "General",
  emergency_department: "Urgențe",
  icu_ward: "ATI",
};

type ConsumableRequest = {
  id: string;
  department: string;
  requestedBy: string;
  itemsJson: string;
  priority: string;
  status: string;
  notes: string | null;
  fulfilledAt: string | null;
  fulfilledBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  locationType: string;
  locationId: string | null;
  serialNumber: string | null;
  status: string;
  notes: string | null;
  lastMaintenanceAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TransportRequest = {
  id: string;
  patientName: string;
  patientId: string | null;
  fromLocation: string;
  toLocation: string;
  transportType: string;
  requestedBy: string;
  scheduledAt: string | null;
  status: string;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type RoomForCleaning = {
  $id: string;
  roomNumber: string;
  floor: number;
  department: string;
  roomType: string;
  maxCapacity: number;
  currentOccupancy: number;
  roomStatus?: string;
};

type Props = {
  consumableRequests: ConsumableRequest[];
  equipment: EquipmentItem[];
  transportRequests: TransportRequest[];
  rooms: RoomForCleaning[];
};

const TABS = [
  { id: "consumable", label: "Cereri consumabile", icon: "📦" },
  { id: "equipment", label: "Inventar echipament", icon: "🩺" },
  { id: "transport", label: "Transport intern", icon: "🚐" },
  { id: "cleaning", label: "Curățenie / dezinfecție", icon: "🧹" },
] as const;

export function LogisticsDashboard(props: Props) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("consumable");
  const router = useRouter();

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Secțiuni logistică">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            aria-current={activeTab === tab.id ? "true" : undefined}
          >
            <span aria-hidden>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "consumable" && (
        <ConsumableSection requests={props.consumableRequests} onUpdate={refresh} />
      )}
      {activeTab === "equipment" && (
        <EquipmentSection equipment={props.equipment} onUpdate={refresh} />
      )}
      {activeTab === "transport" && (
        <TransportSection requests={props.transportRequests} onUpdate={refresh} />
      )}
      {activeTab === "cleaning" && (
        <CleaningSection rooms={props.rooms} onUpdate={refresh} />
      )}
    </div>
  );
}

function ConsumableSection({ requests, onUpdate }: { requests: ConsumableRequest[]; onUpdate: () => void }) {
  const [adding, setAdding] = useState(false);
  const [dept, setDept] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [itemsStr, setItemsStr] = useState("");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("create");
    const items = itemsStr
      .split("\n")
      .map((line) => {
        const [name, qty] = line.split(/[\t,]/).map((s) => s.trim());
        return { name: name || "", quantity: qty || "1" };
      })
      .filter((i) => i.name);
    const res = await createConsumableRequest({
      department: dept,
      requestedBy,
      items,
      priority,
      notes: notes || undefined,
    });
    setLoading(null);
    if (!res?.error) {
      setAdding(false);
      setDept("");
      setRequestedBy("");
      setItemsStr("");
      setNotes("");
      onUpdate();
    }
  };

  const handleStatus = async (id: string, status: string) => {
    setLoading(id);
    await updateConsumableRequestStatus(id, status, "Admin");
    setLoading(null);
    onUpdate();
  };

  const pending = requests.filter((r) => r.status === "pending").length;
  const fulfilled = requests.filter((r) => r.status === "fulfilled").length;

  return (
    <section className="admin-section-card">
      <h2 className="admin-section-title">Cereri consumabile</h2>
      <p className="admin-section-desc">
        Secțiile cer materiale; depozitul aprobă și onorează cererile.
      </p>
      <div className="admin-grid-symmetric mb-6">
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">În așteptare</span>
          <span className="text-24-bold text-dark-900">{pending}</span>
        </div>
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">Onorate</span>
          <span className="text-24-bold text-green-700">{fulfilled}</span>
        </div>
      </div>
      {!adding ? (
        <Button type="button" className="shad-primary-btn mb-6" onClick={() => setAdding(true)}>
          + Cerere nouă
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-dark-200 bg-dark-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-14-medium text-dark-700">Secție</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
                required
              >
                <option value="">Selectează</option>
                {Object.entries(DEPT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Solicitant</label>
              <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} required />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-14-medium text-dark-700">Articole (câte unul per linie, opțional cantitate după virgulă)</label>
            <Textarea value={itemsStr} onChange={(e) => setItemsStr(e.target.value)} rows={3} className="mt-1" placeholder="Masti chirurgicale, 100&#10;Mănuși M" />
          </div>
          <div className="mt-4 flex gap-4">
            <div>
              <label className="text-14-medium text-dark-700">Prioritate</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="ml-2 rounded-md border border-dark-200 px-3 py-2">
                <option value="low">Scăzută</option>
                <option value="normal">Normală</option>
                <option value="high">Ridicată</option>
                <option value="urgent">Urgentă</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-14-medium text-dark-700">Note</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={!!loading} className="shad-primary-btn">Salvează</Button>
            <Button type="button" className="shad-gray-btn" onClick={() => setAdding(false)}>Anulare</Button>
          </div>
        </form>
      )}
      <ul className="space-y-3">
        {requests.length === 0 && <li className="text-14-regular text-dark-500">Nicio cerere.</li>}
        {requests.slice(0, 30).map((r) => {
          let items: { name: string; quantity?: string }[] = [];
          try {
            items = JSON.parse(r.itemsJson) || [];
          } catch {}
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dark-200 bg-white p-4">
              <div>
                <span className="text-14-medium text-dark-900">{DEPT_LABELS[r.department] || r.department}</span>
                <span className="text-14-regular text-dark-500"> — {r.requestedBy}</span>
                <p className="text-12-regular text-dark-500 mt-1">
                  {items.map((i) => i.name + (i.quantity ? ` (${i.quantity})` : "")).join(", ") || "—"}
                </p>
                <p className="text-12-regular text-dark-400">{formatDateTime(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-12-regular ${r.status === "fulfilled" ? "bg-green-100 text-green-800" : r.status === "approved" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                  {r.status === "pending" ? "În așteptare" : r.status === "approved" ? "Aprobat" : "Onorat"}
                </span>
                {r.status === "pending" && (
                  <>
                    <Button size="sm" className="shad-primary-btn" disabled={loading === r.id} onClick={() => handleStatus(r.id, "approved")}>Aprobă</Button>
                    <Button size="sm" className="shad-gray-btn" disabled={loading === r.id} onClick={() => handleStatus(r.id, "fulfilled")}>Onorează</Button>
                  </>
                )}
                {r.status === "approved" && (
                  <Button size="sm" className="shad-primary-btn" disabled={loading === r.id} onClick={() => handleStatus(r.id, "fulfilled")}>Onorează</Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EquipmentSection({ equipment, onUpdate }: { equipment: EquipmentItem[]; onUpdate: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [locationType, setLocationType] = useState("department");
  const [locationId, setLocationId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("create");
    await createEquipment({ name, category, locationType, locationId: locationId || undefined, serialNumber: serialNumber || undefined, notes: notes || undefined });
    setLoading(null);
    setAdding(false);
    setName("");
    setCategory("");
    setSerialNumber("");
    setNotes("");
    onUpdate();
  };

  const handleStatus = async (id: string, status: string) => {
    setLoading(id);
    await updateEquipmentStatus(id, status);
    setLoading(null);
    onUpdate();
  };

  const available = equipment.filter((e) => e.status === "available").length;
  const inUse = equipment.filter((e) => e.status === "in_use").length;
  const maintenance = equipment.filter((e) => e.status === "maintenance").length;

  return (
    <section className="admin-section-card">
      <h2 className="admin-section-title">Inventar echipament</h2>
      <p className="admin-section-desc">
        Echipament per sală/secție: disponibil, în uz, în reparație.
      </p>
      <div className="admin-grid-symmetric mb-6">
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">Disponibil</span>
          <span className="text-24-bold text-green-700">{available}</span>
        </div>
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">În uz</span>
          <span className="text-24-bold text-dark-900">{inUse}</span>
        </div>
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">În reparație</span>
          <span className="text-24-bold text-amber-700">{maintenance}</span>
        </div>
      </div>
      {!adding ? (
        <Button type="button" className="shad-primary-btn mb-6" onClick={() => setAdding(true)}>
          + Adaugă echipament
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-dark-200 bg-dark-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-14-medium text-dark-700">Denumire</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Categorie</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ex: Monitor, Pompă" required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Locație tip</label>
              <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2">
                <option value="department">Secție</option>
                <option value="room">Sală</option>
              </select>
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Locație (id sau nume)</label>
              <Input value={locationId} onChange={(e) => setLocationId(e.target.value)} />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Nr. serie</label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Note</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={!!loading} className="shad-primary-btn">Salvează</Button>
            <Button type="button" className="shad-gray-btn" onClick={() => setAdding(false)}>Anulare</Button>
          </div>
        </form>
      )}
      <ul className="admin-grid-symmetric">
        {equipment.length === 0 && <li className="col-span-full text-14-regular text-dark-500">Niciun echipament înregistrat.</li>}
        {equipment.map((e) => (
          <li key={e.id} className="admin-section-card flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-16-medium text-dark-900">{e.name}</span>
              <span className={`rounded-full px-2 py-1 text-12-regular ${e.status === "available" ? "bg-green-100 text-green-800" : e.status === "in_use" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                {e.status === "available" ? "Disponibil" : e.status === "in_use" ? "În uz" : "Reparație"}
              </span>
            </div>
            <p className="text-12-regular text-dark-500">{e.category} · {e.locationType}</p>
            <select
              value={e.status}
              onChange={(ev) => handleStatus(e.id, ev.target.value)}
              disabled={loading === e.id}
              className="w-full rounded-md border border-dark-200 px-2 py-1 text-12-regular"
            >
              <option value="available">Disponibil</option>
              <option value="in_use">În uz</option>
              <option value="maintenance">În reparație</option>
              <option value="out_of_service">Scos din uz</option>
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TransportSection({ requests, onUpdate }: { requests: TransportRequest[]; onUpdate: () => void }) {
  const [adding, setAdding] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [transportType, setTransportType] = useState("wheelchair");
  const [requestedBy, setRequestedBy] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("create");
    await createInternalTransport({
      patientName,
      fromLocation,
      toLocation,
      transportType,
      requestedBy,
      scheduledAt: scheduledAt || undefined,
      notes: notes || undefined,
    });
    setLoading(null);
    setAdding(false);
    setPatientName("");
    setFromLocation("");
    setToLocation("");
    setRequestedBy("");
    setScheduledAt("");
    setNotes("");
    onUpdate();
  };

  const handleStatus = async (id: string, status: string) => {
    setLoading(id);
    await updateInternalTransportStatus(id, status);
    setLoading(null);
    onUpdate();
  };

  const pending = requests.filter((r) => r.status === "pending" || r.status === "scheduled" || r.status === "in_progress").length;
  const completed = requests.filter((r) => r.status === "completed").length;

  return (
    <section className="admin-section-card">
      <h2 className="admin-section-title">Transport intern</h2>
      <p className="admin-section-desc">
        Transfer pacienți între secții, la investigații sau bloc.
      </p>
      <div className="admin-grid-symmetric mb-6">
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">Active</span>
          <span className="text-24-bold text-dark-900">{pending}</span>
        </div>
        <div className="admin-stat-card">
          <span className="text-12-regular text-dark-500">Finalizate</span>
          <span className="text-24-bold text-green-700">{completed}</span>
        </div>
      </div>
      {!adding ? (
        <Button type="button" className="shad-primary-btn mb-6" onClick={() => setAdding(true)}>
          + Cerere transport
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-dark-200 bg-dark-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-14-medium text-dark-700">Pacient</label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Solicitant</label>
              <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">De la</label>
              <Input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} placeholder="ex: Secție Chirurgie" required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Către</label>
              <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="ex: Bloc operator" required />
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Tip transport</label>
              <select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2">
                <option value="wheelchair">Scândură cu rotile</option>
                <option value="stretcher">Targă</option>
                <option value="bed">Pat</option>
                <option value="ambulance_internal">Ambulanță internă</option>
              </select>
            </div>
            <div>
              <label className="text-14-medium text-dark-700">Programat la (opțional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-14-medium text-dark-700">Note</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={!!loading} className="shad-primary-btn">Salvează</Button>
            <Button type="button" className="shad-gray-btn" onClick={() => setAdding(false)}>Anulare</Button>
          </div>
        </form>
      )}
      <ul className="space-y-3">
        {requests.length === 0 && <li className="text-14-regular text-dark-500">Nicio cerere de transport.</li>}
        {requests.slice(0, 25).map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dark-200 bg-white p-4">
            <div>
              <span className="text-14-medium text-dark-900">{r.patientName}</span>
              <p className="text-12-regular text-dark-500">{r.fromLocation} → {r.toLocation}</p>
              <p className="text-12-regular text-dark-400">{formatDateTime(r.createdAt)} · {r.transportType}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-12-regular ${r.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {r.status === "pending" ? "În așteptare" : r.status === "in_progress" ? "În curs" : r.status === "completed" ? "Finalizat" : r.status}
              </span>
              {r.status !== "completed" && r.status !== "cancelled" && (
                <Button size="sm" className="shad-primary-btn" disabled={loading === r.id} onClick={() => handleStatus(r.id, "completed")}>Finalizează</Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CleaningSection({ rooms, onUpdate }: { rooms: RoomForCleaning[]; onUpdate: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatus = async (roomId: string, roomStatus: string) => {
    setLoading(roomId);
    await updateRoomCleaningStatus(roomId, roomStatus);
    setLoading(null);
    onUpdate();
  };

  const byDept = rooms.reduce((acc, r) => {
    if (!acc[r.department]) acc[r.department] = [];
    acc[r.department].push(r);
    return acc;
  }, {} as Record<string, RoomForCleaning[]>);

  return (
    <section className="admin-section-card">
      <h2 className="admin-section-title">Curățenie și dezinfecție</h2>
      <p className="admin-section-desc">
        Stare cameră: disponibilă, în curățenie sau în dezinfecție. Paturile în curățenie nu sunt alocate.
      </p>
      <div className="space-y-6">
        {Object.entries(byDept).map(([dept, roomList]) => (
          <div key={dept}>
            <h3 className="text-16-semibold text-dark-800 mb-3">{DEPT_LABELS[dept] || dept}</h3>
            <div className="admin-grid-symmetric">
              {roomList.map((room) => (
                <div key={room.$id} className="admin-section-card flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-16-medium text-dark-900">Sala {room.roomNumber}</span>
                    <span className="text-12-regular text-dark-500">Et. {room.floor} · {room.currentOccupancy}/{room.maxCapacity}</span>
                  </div>
                  <select
                    value={room.roomStatus || "available"}
                    onChange={(e) => handleStatus(room.$id, e.target.value)}
                    disabled={loading === room.$id}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
                  >
                    <option value="available">Disponibilă</option>
                    <option value="cleaning">În curățenie</option>
                    <option value="disinfection">Dezinfecție</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {rooms.length === 0 && <p className="text-14-regular text-dark-500">Nicio sală înregistrată.</p>}
    </section>
  );
}
