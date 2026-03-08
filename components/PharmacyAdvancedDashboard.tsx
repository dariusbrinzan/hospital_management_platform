"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Package, ShoppingCart, Pill, AlertTriangle, ClipboardList } from "lucide-react";
import Link from "next/link";

type Order = { $id: string; orderNumber: string; status: string; requestedBy: string; requestedAt: string; createdAt: string };
type Dispensing = { $id: string; patientName?: string; medicationName: string; quantity: number; dispensedAt: string; dispensedBy: string };
type Interaction = { $id: string; medicationName1: string; medicationName2: string; severity: string; description?: string };
type MedRequest = {
  $id: string;
  patientId: string;
  patientName: string | null;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  prescriptionQuantity: string | null;
  doctorName: string | null;
  visitDate: string | null;
  status: string;
  requestedAt: string;
};

export function PharmacyAdvancedDashboard() {
  const [tab, setTab] = useState<"orders" | "dispensings" | "interactions" | "requests">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [dispensings, setDispensings] = useState<Dispensing[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [requests, setRequests] = useState<MedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (tab === "orders") fetch("/api/admin/pharmacy/orders").then((r) => r.json()).then(setOrders).catch(() => setOrders([]));
    else if (tab === "dispensings") fetch("/api/admin/pharmacy/dispensings").then((r) => r.json()).then(setDispensings).catch(() => setDispensings([]));
    else if (tab === "interactions") fetch("/api/admin/pharmacy/interactions").then((r) => r.json()).then(setInteractions).catch(() => setInteractions([]));
    else if (tab === "requests") {
      const url = requestStatusFilter && requestStatusFilter !== "all" ? `/api/admin/pharmacy/requests?status=${encodeURIComponent(requestStatusFilter)}` : "/api/admin/pharmacy/requests";
      fetch(url).then((r) => r.json()).then(setRequests).catch(() => setRequests([]));
    }
    setLoading(false);
  }, [tab, requestStatusFilter]);

  const updateRequestStatus = async (id: string, status: string, extra?: { rejectionReason?: string; decontareType?: string }) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/pharmacy/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        const listRes = await fetch(requestStatusFilter && requestStatusFilter !== "all" ? `/api/admin/pharmacy/requests?status=${requestStatusFilter}` : "/api/admin/pharmacy/requests");
        const data = await listRes.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    received: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
        <Button variant={tab === "orders" ? "default" : "outline"} size="sm" onClick={() => setTab("orders")} className="rounded-xl">
          <ShoppingCart className="mr-2 size-4" />
          Comenzi
        </Button>
        <Button variant={tab === "requests" ? "default" : "outline"} size="sm" onClick={() => setTab("requests")} className="rounded-xl">
          <ClipboardList className="mr-2 size-4" />
          Cereri pacienți
        </Button>
        <Button variant={tab === "dispensings" ? "default" : "outline"} size="sm" onClick={() => setTab("dispensings")} className="rounded-xl">
          <Package className="mr-2 size-4" />
          Dispensări
        </Button>
        <Button variant={tab === "interactions" ? "default" : "outline"} size="sm" onClick={() => setTab("interactions")} className="rounded-xl">
          <Pill className="mr-2 size-4" />
          Interacțiuni
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">
            {tab === "orders" && "Comenzi aprovizionare"}
            {tab === "requests" && "Cereri medicamente (pacienți)"}
            {tab === "dispensings" && "Istoric dispensări"}
            {tab === "interactions" && "Interacțiuni medicamentoase"}
          </CardTitle>
          <CardDescription>
            {tab === "orders" && "Trimitere, aprobare și primire comenzi. Creare comandă din pagina Medicamente (stoc scăzut)."}
            {tab === "requests" && "Aprobare, dispensare și decontare cereri trimise de pacienți pe baza rețetelor."}
            {tab === "dispensings" && "Dispensări legate de rețete. Dispensarea se face din Farmacie sau din ficha pacientului."}
            {tab === "interactions" && "Monitorizare interacțiuni (minor, moderate, major, contraindicated). Verificare la prescriere."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Se încarcă...</p>
          ) : tab === "requests" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "approved", "dispensed", "decontat", "rejected"].map((s) => (
                  <Button
                    key={s}
                    variant={requestStatusFilter === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRequestStatusFilter(s)}
                    className="rounded-lg"
                  >
                    {s === "all" ? "Toate" : s === "pending" ? "În așteptare" : s === "approved" ? "Aprobate" : s === "dispensed" ? "Dispensate" : s === "decontat" ? "Decontate" : "Respinse"}
                  </Button>
                ))}
              </div>
              {requests.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
                  Nu există cereri pentru acest filtru.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r.$id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{r.medicationName}</p>
                        <p className="text-sm text-slate-500">{r.dosage}{r.prescriptionQuantity && ` · ${r.prescriptionQuantity}`} · {r.patientName ?? r.patientId}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(r.requestedAt).dateTime}{r.doctorName && ` · Dr. ${r.doctorName}`}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                          r.status === "approved" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" :
                          r.status === "dispensed" ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" :
                          r.status === "decontat" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          r.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-slate-100 text-slate-700"
                        }`}>{r.status}</span>
                        {r.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="rounded-lg" disabled={updatingId === r.$id} onClick={() => updateRequestStatus(r.$id, "approved")}>Aprobare</Button>
                            <Button size="sm" variant="outline" className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300" disabled={updatingId === r.$id} onClick={() => updateRequestStatus(r.$id, "rejected", { rejectionReason: "Respinse de farmacie" })}>Respinge</Button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <Button size="sm" className="rounded-lg" disabled={updatingId === r.$id} onClick={() => updateRequestStatus(r.$id, "dispensed")}>Marchează dispensat</Button>
                        )}
                        {r.status === "dispensed" && (
                          <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700" disabled={updatingId === r.$id} onClick={() => updateRequestStatus(r.$id, "decontat", { decontareType: "full" })}>Marchează decontat</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "orders" ? (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
                  Nu există comenzi. Creează o comandă din pagina <Link href="/admin/medications" className="text-teal-600 hover:underline">Medicamente</Link> (buton Comandă reaprovizionare la un stoc).
                </p>
              ) : (
                orders.map((o) => (
                  <div key={o.$id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{o.orderNumber}</span>
                      <span className="ml-2 text-sm text-slate-500">Cerut de {o.requestedBy}</span>
                      <span className="ml-2 text-xs text-slate-400">{formatDateTime(o.requestedAt).dateTime}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status] || "bg-slate-100 text-slate-700"}`}>{o.status}</span>
                  </div>
                ))
              )}
            </div>
          ) : tab === "dispensings" ? (
            <div className="space-y-3">
              {dispensings.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
                  Nu există dispensări înregistrate.
                </p>
              ) : (
                dispensings.slice(0, 30).map((d) => (
                  <div key={d.$id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{d.medicationName}</span>
                      <span className="ml-2 text-sm text-slate-600">× {d.quantity}</span>
                      {d.patientName && <span className="ml-2 text-sm text-slate-500">— {d.patientName}</span>}
                      <span className="ml-2 text-xs text-slate-400">{formatDateTime(d.dispensedAt).dateTime} · {d.dispensedBy}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {interactions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
                  Nu există interacțiuni înregistrate. Adaugă perechi de medicamente cu severitate (minor, moderate, major, contraindicated).
                </p>
              ) : (
                interactions.map((i) => (
                  <div key={i.$id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{i.medicationName1}</span>
                      <span className="mx-2 text-slate-400">+</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{i.medicationName2}</span>
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${i.severity === "contraindicated" || i.severity === "major" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}`}>{i.severity}</span>
                      {i.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{i.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500">
        Stocuri și reaprovizionare rapidă: <Link href="/admin/medications" className="text-teal-600 hover:underline">Medicamente</Link>.
        Loturi cu expirare și comenzi create din stocuri (buton Comandă la stoc scăzut) vor apărea în Comenzi după implementare formular creare comandă.
      </p>
    </div>
  );
}
