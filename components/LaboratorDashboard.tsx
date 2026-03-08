"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { FlaskConical, Plus, ArrowLeft, Check } from "lucide-react";

type Patient = { $id: string; name: string; email: string };
type TestType = { $id: string; code: string; name: string; category: string; unit: string | null; referenceRange: string | null };
type OrderListItem = { $id: string; patientId: string; patientName: string | null; orderedBy: string; orderedAt: string; status: string; priority: string | null };
type OrderDetail = {
  $id: string;
  patientId: string;
  status: string;
  priority: string | null;
  notes: string | null;
  orderedAt: string;
  tests: {
    $id: string;
    testCode: string;
    testName: string;
    unit: string | null;
    referenceRange: string | null;
    medicationName: string | null;
    status: string;
    resultValue: string | null;
    resultUnit: string | null;
    resultAt: string | null;
    notes: string | null;
  }[];
};

export function LaboratorDashboard() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [newOrderPatientId, setNewOrderPatientId] = useState("");
  const [newOrderTestIds, setNewOrderTestIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resultValues, setResultValues] = useState<Record<string, { resultValue: string; resultUnit: string; referenceRange: string; notes: string }>>({});

  const loadOrders = () => {
    const status = statusFilter && statusFilter !== "all" ? statusFilter : undefined;
    const url = status ? `/api/admin/lab/orders?status=${encodeURIComponent(status)}` : "/api/admin/lab/orders";
    fetch(url).then((r) => r.json()).then(setOrders).catch(() => setOrders([]));
  };

  useEffect(() => {
    setLoading(true);
    loadOrders();
    fetch("/api/admin/patients").then((r) => r.json()).then(setPatients).catch(() => setPatients([]));
    fetch("/api/admin/lab/test-types").then((r) => r.json()).then(setTestTypes).catch(() => setTestTypes([]));
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    if (selectedOrderId && view === "detail") {
      fetch(`/api/admin/lab/orders/${selectedOrderId}`)
        .then((r) => r.json())
        .then((data) => {
          setOrderDetail(data);
          const initial: Record<string, { resultValue: string; resultUnit: string; referenceRange: string; notes: string }> = {};
          data.tests?.forEach((t: any) => {
            if (t.status === "pending") {
              initial[t.$id] = {
                resultValue: "",
                resultUnit: t.unit ?? "",
                referenceRange: t.referenceRange ?? "",
                notes: "",
              };
            }
          });
          setResultValues(initial);
        })
        .catch(() => setOrderDetail(null));
    }
  }, [selectedOrderId, view]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderPatientId || newOrderTestIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/lab/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: newOrderPatientId,
          tests: newOrderTestIds.map((testTypeId) => ({ testTypeId })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Eroare la creare comandă");
        return;
      }
      setNewOrderPatientId("");
      setNewOrderTestIds([]);
      setView("list");
      loadOrders();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetResult = async (testId: string) => {
    const data = resultValues[testId];
    if (!data?.resultValue?.trim()) {
      alert("Introduceți valoarea rezultatului.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/lab/orders/${selectedOrderId}/tests/${testId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultValue: data.resultValue.trim(),
          resultUnit: data.resultUnit || undefined,
          referenceRange: data.referenceRange || undefined,
          notes: data.notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Eroare la salvare rezultat");
        return;
      }
      if (selectedOrderId) {
        const detailRes = await fetch(`/api/admin/lab/orders/${selectedOrderId}`);
        const detail = await detailRes.json();
        setOrderDetail(detail);
        setResultValues((prev) => {
          const next = { ...prev };
          delete next[testId];
          detail.tests?.forEach((t: any) => {
            if (t.status === "pending" && !next[t.$id]) {
              next[t.$id] = { resultValue: "", resultUnit: t.unit ?? "", referenceRange: t.referenceRange ?? "", notes: "" };
            }
          });
          return next;
        });
      }
    } catch {
      alert("Eroare la salvare rezultat");
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <div className="space-y-6">
      {view === "list" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toate statusurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">În progres</SelectItem>
                <SelectItem value="completed">Finalizat</SelectItem>
                <SelectItem value="cancelled">Anulat</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setView("new")} className="rounded-xl">
              <Plus className="mr-2 size-4" />
              Comandă nouă
            </Button>
          </div>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Comenzi analize</CardTitle>
              <CardDescription>
                Comenzi laborator (incl. TDM – monitorizare terapie). Selectați o comandă pentru a introduce rezultatele.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-slate-500">Se încarcă...</p>
              ) : orders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
                  Nu există comenzi. Creați o comandă nouă.
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div
                      key={o.$id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{o.patientName ?? o.patientId}</span>
                        <span className="ml-2 text-sm text-slate-500">{formatDateTime(o.orderedAt).dateTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {o.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrderId(o.$id);
                            setView("detail");
                          }}
                        >
                          Detaliu
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {view === "new" && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FlaskConical className="size-5" />
              Comandă analize nouă
            </CardTitle>
            <CardDescription>Selectați pacientul și tipurile de analize (TDM pentru monitorizare terapie).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <Label>Pacient</Label>
                <Select value={newOrderPatientId} onValueChange={setNewOrderPatientId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Alegeți pacientul" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.$id} value={p.$id}>
                        {p.name} {p.email ? `(${p.email})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipuri analize</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {testTypes.map((t) => (
                    <label key={t.$id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={newOrderTestIds.includes(t.$id)}
                        onChange={(e) => {
                          if (e.target.checked) setNewOrderTestIds((prev) => [...prev, t.$id]);
                          else setNewOrderTestIds((prev) => prev.filter((id) => id !== t.$id));
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">
                        {t.name}
                        {t.category === "tdm" && <span className="ml-1 text-amber-600 dark:text-amber-400">(TDM)</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Se creează..." : "Creează comandă"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setView("list")}>
                  Anulare
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {view === "detail" && orderDetail && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-slate-100">Comandă #{orderDetail.$id.slice(0, 8)}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setView("list"); setSelectedOrderId(null); setOrderDetail(null); }}>
                <ArrowLeft className="mr-2 size-4" />
                Înapoi
              </Button>
            </div>
            <CardDescription>
              Status: <span className={statusColor[orderDetail.status]}>{orderDetail.status}</span>
              {orderDetail.priority && ` · Prioritate: ${orderDetail.priority}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderDetail.tests?.map((t) => (
              <div key={t.$id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {t.testName} ({t.testCode})
                    {t.medicationName && <span className="ml-2 text-sm text-slate-500">— {t.medicationName}</span>}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                    {t.status}
                  </span>
                </div>
                {t.status === "completed" ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Rezultat: <strong>{t.resultValue}</strong> {t.resultUnit && t.resultUnit}
                    {t.referenceRange && ` (interval: ${t.referenceRange})`}
                    {t.resultAt && ` · ${formatDateTime(t.resultAt).dateTime}`}
                  </p>
                ) : (
                  (() => {
                    const def = { resultValue: "", resultUnit: t.unit ?? "", referenceRange: t.referenceRange ?? "", notes: "" };
                    const rv = { ...def, ...resultValues[t.$id] };
                    return (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label className="text-xs">Valoare *</Label>
                          <Input
                            value={rv.resultValue}
                            onChange={(e) => setResultValues((prev) => ({ ...prev, [t.$id]: { ...def, ...prev[t.$id], resultValue: e.target.value } }))}
                            placeholder="ex. 15.2"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unitate</Label>
                          <Input
                            value={rv.resultUnit}
                            onChange={(e) => setResultValues((prev) => ({ ...prev, [t.$id]: { ...def, ...prev[t.$id], resultUnit: e.target.value } }))}
                            placeholder={t.unit ?? ""}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Interval referință</Label>
                          <Input
                            value={rv.referenceRange}
                            onChange={(e) => setResultValues((prev) => ({ ...prev, [t.$id]: { ...def, ...prev[t.$id], referenceRange: e.target.value } }))}
                            placeholder={t.referenceRange ?? ""}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Note</Label>
                            <Input
                              value={rv.notes}
                              onChange={(e) => setResultValues((prev) => ({ ...prev, [t.$id]: { ...def, ...prev[t.$id], notes: e.target.value } }))}
                              placeholder="Opțional"
                            />
                          </div>
                          <Button type="button" size="sm" onClick={() => handleSetResult(t.$id)}>
                            <Check className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
