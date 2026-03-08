"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Package, ShoppingCart, Pill, AlertTriangle } from "lucide-react";
import Link from "next/link";

type Order = { $id: string; orderNumber: string; status: string; requestedBy: string; requestedAt: string; createdAt: string };
type Dispensing = { $id: string; patientName?: string; medicationName: string; quantity: number; dispensedAt: string; dispensedBy: string };
type Interaction = { $id: string; medicationName1: string; medicationName2: string; severity: string; description?: string };

export function PharmacyAdvancedDashboard() {
  const [tab, setTab] = useState<"orders" | "dispensings" | "interactions">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [dispensings, setDispensings] = useState<Dispensing[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === "orders") fetch("/api/admin/pharmacy/orders").then((r) => r.json()).then(setOrders).catch(() => setOrders([]));
    else if (tab === "dispensings") fetch("/api/admin/pharmacy/dispensings").then((r) => r.json()).then(setDispensings).catch(() => setDispensings([]));
    else if (tab === "interactions") fetch("/api/admin/pharmacy/interactions").then((r) => r.json()).then(setInteractions).catch(() => setInteractions([]));
    setLoading(false);
  }, [tab]);

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
            {tab === "dispensings" && "Istoric dispensări"}
            {tab === "interactions" && "Interacțiuni medicamentoase"}
          </CardTitle>
          <CardDescription>
            {tab === "orders" && "Trimitere, aprobare și primire comenzi. Creare comandă din pagina Medicamente (stoc scăzut)."}
            {tab === "dispensings" && "Dispensări legate de rețete. Dispensarea se face din Farmacie sau din ficha pacientului."}
            {tab === "interactions" && "Monitorizare interacțiuni (minor, moderate, major, contraindicated). Verificare la prescriere."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Se încarcă...</p>
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
