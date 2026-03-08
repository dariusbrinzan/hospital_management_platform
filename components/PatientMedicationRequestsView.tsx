"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Pill, Send, ClipboardList, CheckCircle2, XCircle, Truck, BadgeCheck } from "lucide-react";

type RequestItem = {
  $id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  prescriptionQuantity: string | null;
  doctorName: string | null;
  visitDate: string | null;
  status: string;
  requestedAt: string;
  approvedAt?: string | null;
  dispensedAt?: string | null;
  decontatAt?: string | null;
  decontareType?: string | null;
  rejectionReason?: string | null;
};

type PrescriptionItem = {
  $id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: string | null;
  status: string;
  doctorName: string | null;
  visitDate: string | null;
};

interface PatientMedicationRequestsViewProps {
  userId: string;
  patientId: string;
}

export function PatientMedicationRequestsView({ userId, patientId }: PatientMedicationRequestsViewProps) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/patients/${patientId}/medication-requests`).then((r) => r.json()).then(setRequests).catch(() => setRequests([])),
      fetch(`/api/patients/${patientId}/prescriptions-for-request`).then((r) => r.json()).then(setPrescriptions).catch(() => setPrescriptions([])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [patientId]);

  const handleRequest = async (prescriptionId: string) => {
    setSubmitting(prescriptionId);
    try {
      const res = await fetch(`/api/patients/${patientId}/medication-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Eroare la trimiterea cererii");
        return;
      }
      load();
    } catch {
      alert("Eroare la trimiterea cererii");
    } finally {
      setSubmitting(null);
    }
  };

  const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
    pending: { label: "În așteptare", icon: ClipboardList, className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    approved: { label: "Aprobat", icon: CheckCircle2, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
    dispensed: { label: "Dispensat", icon: Truck, className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
    decontat: { label: "Decontat", icon: BadgeCheck, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
    rejected: { label: "Respins", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  };

  const requestedPrescriptionIds = new Set(requests.filter((r) => r.status === "pending" || r.status === "approved").map((r) => r.prescriptionId));
  const activePrescriptions = prescriptions.filter((p) => p.status === "active" && !requestedPrescriptionIds.has(p.$id));

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Pill className="size-5 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-medium uppercase tracking-wide">Medicamente</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Cereri medicamente
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Solicită medicamente pe baza rețetelor active. După aprobare, farmacia va pregăti comanda; după dispensare, poți marca decontarea (asigurare/CAS).
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Se încarcă...</p>
      ) : (
        <>
          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                <ClipboardList className="size-4" />
                Cererile mele
              </CardTitle>
              <CardDescription>
                Status: în așteptare → aprobat → dispensat → decontat
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <div className="border-t border-slate-200 p-8 text-center dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nu ai trimis încă nicio cerere. Solicită un medicament din rețetele active mai jos.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {requests.map((r) => {
                    const config = statusConfig[r.status] ?? statusConfig.pending;
                    const Icon = config.icon;
                    return (
                      <div
                        key={r.$id}
                        className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{r.medicationName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {r.dosage}
                            {r.prescriptionQuantity && ` · ${r.prescriptionQuantity}`}
                            {r.doctorName && ` · Dr. ${r.doctorName}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Cerere: {formatDateTime(r.requestedAt).dateTime}
                            {r.dispensedAt && ` · Dispensat: ${formatDateTime(r.dispensedAt).dateOnly}`}
                            {r.decontatAt && ` · Decontat: ${formatDateTime(r.decontatAt).dateOnly}`}
                          </p>
                          {r.rejectionReason && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Motiv respingere: {r.rejectionReason}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
                          <Icon className="size-3.5" />
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                <Send className="size-4" />
                Solicită medicament din rețetă
              </CardTitle>
              <CardDescription>
                Rețete active fără cerere în curs. Apasă „Solicită” pentru a trimite cererea la farmacie.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activePrescriptions.length === 0 ? (
                <div className="border-t border-slate-200 p-8 text-center dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nu ai rețete active disponibile pentru cerere sau toate au deja cereri în curs.
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Mergi la <strong>Rețete</strong> pentru a vedea toate rețetele prescrise de medic.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {activePrescriptions.map((p) => (
                    <div
                      key={p.$id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{p.medicationName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {p.dosage} · {p.frequency}
                          {p.quantity && ` · ${p.quantity}`}
                          {p.doctorName && ` · Dr. ${p.doctorName}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleRequest(p.$id)}
                        disabled={submitting === p.$id}
                      >
                        {submitting === p.$id ? "Se trimite..." : "Solicită"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
