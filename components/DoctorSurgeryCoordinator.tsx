"use client";

import { ClipboardPlus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type PatientOption = {
  $id: string;
  name: string;
  primaryPhysician?: string | null;
};

type SurgeryCaseBundle = {
  caseItem: SurgeryCase;
  anesthesiaConsult: AnesthesiaConsultation | null;
  booking: SurgeryBooking | null;
  financial: SurgeryFinancialCase | null;
};

interface DoctorSurgeryCoordinatorProps {
  doctorName: string;
  patients: PatientOption[];
  initialPatientId?: string;
  surgeryCases: SurgeryCaseBundle[];
}

const SURGICAL_SPECIALTIES = [
  "Chirurgie generală",
  "Ortopedie",
  "Neurochirurgie",
  "Chirurgie vasculară",
  "ORL",
  "Ginecologie",
  "Urologie",
];

const ASA_OPTIONS = ["ASA I", "ASA II", "ASA III", "ASA IV", "ASA V"];

const defaultDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + 2);
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

function toLocalInput(value?: Date | string | null) {
  if (!value) return defaultDate();
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function statusLabel(status: SurgeryCaseStatus) {
  switch (status) {
    case "anesthesia_pending":
      return "Consult ATI necesar";
    case "ready_to_schedule":
      return "Pregătit de programare";
    case "scheduled":
      return "Programat";
    case "completed":
      return "Finalizat";
    case "cancelled":
      return "Anulat";
    default:
      return "Propus";
  }
}

function urgencyLabel(urgency: SurgeryUrgency) {
  switch (urgency) {
    case "priority":
      return "Prioritar";
    case "emergency":
      return "Urgent";
    default:
      return "Electiv";
  }
}

export function DoctorSurgeryCoordinator({
  doctorName,
  patients,
  initialPatientId,
  surgeryCases,
}: DoctorSurgeryCoordinatorProps) {
  const router = useRouter();
  const [savingCase, setSavingCase] = useState(false);
  const [savingConsultCaseId, setSavingConsultCaseId] = useState<string | null>(null);
  const [caseForm, setCaseForm] = useState({
    patientId: initialPatientId || "",
    surgicalSpecialty: "Chirurgie generală",
    procedureName: "",
    diagnosis: "",
    urgency: "elective" as SurgeryUrgency,
    estimatedDurationMinutes: "120",
    preferredDate: defaultDate(),
    requiresICUBed: "no",
    implantNeeded: "no",
    clinicalNotes: "",
  });

  const [consultForms, setConsultForms] = useState<Record<string, {
    anesthesiologistName: string;
    consultDate: string;
    asaRisk: string;
    airwayAssessment: string;
    fastingConfirmed: string;
    recommendations: string;
    clearanceStatus: AnesthesiaClearanceStatus;
  }>>(() =>
    Object.fromEntries(
      surgeryCases.map((bundle) => [
        bundle.caseItem.$id,
        {
          anesthesiologistName: bundle.anesthesiaConsult?.anesthesiologistName || "",
          consultDate: toLocalInput(bundle.anesthesiaConsult?.consultDate || new Date()),
          asaRisk: bundle.anesthesiaConsult?.asaRisk || "ASA II",
          airwayAssessment: bundle.anesthesiaConsult?.airwayAssessment || "",
          fastingConfirmed: bundle.anesthesiaConsult?.fastingConfirmed ? "yes" : "no",
          recommendations: bundle.anesthesiaConsult?.recommendations || "",
          clearanceStatus: bundle.anesthesiaConsult?.clearanceStatus || "pending",
        },
      ])
    )
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.$id === caseForm.patientId) ?? null,
    [caseForm.patientId, patients]
  );

  const handleCreateCase = async () => {
    if (!caseForm.patientId || !caseForm.procedureName.trim() || !caseForm.diagnosis.trim()) {
      toast.error("Completează pacientul, procedura și diagnosticul operator.");
      return;
    }

    setSavingCase(true);
    try {
      const response = await fetch("/api/surgery/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: caseForm.patientId,
          requestedByDoctor: doctorName,
          surgicalSpecialty: caseForm.surgicalSpecialty,
          procedureName: caseForm.procedureName,
          diagnosis: caseForm.diagnosis,
          urgency: caseForm.urgency,
          estimatedDurationMinutes: Number(caseForm.estimatedDurationMinutes),
          preferredDate: new Date(caseForm.preferredDate).toISOString(),
          requiresICUBed: caseForm.requiresICUBed === "yes",
          implantNeeded: caseForm.implantNeeded === "yes",
          clinicalNotes: caseForm.clinicalNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva cazul operator.");
      }
      toast.success("Cazul operator a fost trimis către blocul operator.");
      setCaseForm({
        patientId: initialPatientId || "",
        surgicalSpecialty: "Chirurgie generală",
        procedureName: "",
        diagnosis: "",
        urgency: "elective",
        estimatedDurationMinutes: "120",
        preferredDate: defaultDate(),
        requiresICUBed: "no",
        implantNeeded: "no",
        clinicalNotes: "",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la crearea cazului operator.");
    } finally {
      setSavingCase(false);
    }
  };

  const handleConsultSubmit = async (caseId: string) => {
    const form = consultForms[caseId];
    if (!form?.anesthesiologistName.trim()) {
      toast.error("Completează numele medicului anestezist.");
      return;
    }

    setSavingConsultCaseId(caseId);
    try {
      const response = await fetch(`/api/surgery/cases/${caseId}/anesthesia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anesthesiologistName: form.anesthesiologistName,
          consultDate: new Date(form.consultDate).toISOString(),
          asaRisk: form.asaRisk,
          airwayAssessment: form.airwayAssessment,
          fastingConfirmed: form.fastingConfirmed === "yes",
          recommendations: form.recommendations,
          clearanceStatus: form.clearanceStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva consultul ATI.");
      }
      toast.success("Consultul ATI a fost actualizat.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la salvarea consultului ATI.");
    } finally {
      setSavingConsultCaseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <ClipboardPlus className="size-5" />
            <p className="text-sm font-medium">Propunere intervenție</p>
          </div>
          <CardTitle>Trimite pacientul în fluxul de bloc operator</CardTitle>
          <CardDescription>
            După consultație poți defini intervenția, nivelul de urgență, necesarul ATI și nota clinică pentru echipa operatorie.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pacient</label>
            <Select
              value={caseForm.patientId}
              onValueChange={(value) => setCaseForm((prev) => ({ ...prev, patientId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează pacientul" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.$id} value={patient.$id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPatient?.primaryPhysician && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medic curant în fișă: {selectedPatient.primaryPhysician}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialitate chirurgicală</label>
            <Select
              value={caseForm.surgicalSpecialty}
              onValueChange={(value) => setCaseForm((prev) => ({ ...prev, surgicalSpecialty: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SURGICAL_SPECIALTIES.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Intervenție propusă</label>
            <Input
              value={caseForm.procedureName}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, procedureName: event.target.value }))}
              placeholder="ex: Colecistectomie laparoscopică"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Diagnostic operator</label>
            <Input
              value={caseForm.diagnosis}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
              placeholder="ex: Litiază veziculară simptomatică"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioritate</label>
            <Select
              value={caseForm.urgency}
              onValueChange={(value: SurgeryUrgency) => setCaseForm((prev) => ({ ...prev, urgency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elective">Electiv</SelectItem>
                <SelectItem value="priority">Prioritar</SelectItem>
                <SelectItem value="emergency">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Durată estimată (minute)</label>
            <Input
              type="number"
              min="30"
              step="15"
              value={caseForm.estimatedDurationMinutes}
              onChange={(event) =>
                setCaseForm((prev) => ({ ...prev, estimatedDurationMinutes: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dată preferată</label>
            <Input
              type="datetime-local"
              value={caseForm.preferredDate}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, preferredDate: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Necesită pat ATI</label>
              <Select
                value={caseForm.requiresICUBed}
                onValueChange={(value) => setCaseForm((prev) => ({ ...prev, requiresICUBed: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Nu</SelectItem>
                  <SelectItem value="yes">Da</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Necesită implant / consumabile speciale</label>
              <Select
                value={caseForm.implantNeeded}
                onValueChange={(value) => setCaseForm((prev) => ({ ...prev, implantNeeded: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Nu</SelectItem>
                  <SelectItem value="yes">Da</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notă clinică pentru bloc operator</label>
            <Textarea
              rows={4}
              value={caseForm.clinicalNotes}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, clinicalNotes: event.target.value }))}
              placeholder="Ex: pacient anticoagulat, necesită oprire medicație cu 48h înainte; evaluare imagistică deja efectuată."
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="button"
              onClick={handleCreateCase}
              disabled={savingCase}
              className="rounded-lg bg-teal-600 hover:bg-teal-700"
            >
              {savingCase ? "Se salvează..." : "Trimite în bloc operator"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <ShieldCheck className="size-5" />
            <p className="text-sm font-medium">Flux operator curent</p>
          </div>
          <CardTitle>Cazurile propuse de tine</CardTitle>
          <CardDescription>
            Aici urmărești fiecare etapă: consult ATI, programarea în sală și statusul financiar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {surgeryCases.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai propus încă intervenții chirurgicale din acest cont.
            </p>
          ) : (
            surgeryCases.map(({ caseItem, anesthesiaConsult, booking, financial }) => {
              const consultForm = consultForms[caseItem.$id] || {
                anesthesiologistName: "",
                consultDate: defaultDate(),
                asaRisk: "ASA II",
                airwayAssessment: "",
                fastingConfirmed: "no",
                recommendations: "",
                clearanceStatus: "pending" as AnesthesiaClearanceStatus,
              };

              return (
                <div
                  key={caseItem.$id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {caseItem.procedureName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {caseItem.patient?.name} · {caseItem.surgicalSpecialty} · {urgencyLabel(caseItem.urgency)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {statusLabel(caseItem.status)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
                    <p>Diagnostic: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.diagnosis}</span></p>
                    <p>Durată estimată: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.estimatedDurationMinutes} min</span></p>
                    <p>Dată preferată: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.preferredDate ? formatDateTime(caseItem.preferredDate).dateTime : "Nespecificată"}</span></p>
                    <p>ATI postoperator: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.requiresICUBed ? "Da" : "Nu"}</span></p>
                    <p>Implant / materiale speciale: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.implantNeeded ? "Da" : "Nu"}</span></p>
                    <p>Creat la: <span className="font-medium text-slate-800 dark:text-slate-200">{formatDateTime(caseItem.createdAt).dateTime}</span></p>
                  </div>

                  {caseItem.clinicalNotes && (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      {caseItem.clinicalNotes}
                    </p>
                  )}

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Consult preanestezic
                      </h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Input
                          value={consultForm.anesthesiologistName}
                          onChange={(event) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: {
                                ...consultForm,
                                anesthesiologistName: event.target.value,
                              },
                            }))
                          }
                          placeholder="Medic anestezist"
                        />
                        <Input
                          type="datetime-local"
                          value={consultForm.consultDate}
                          onChange={(event) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...consultForm, consultDate: event.target.value },
                            }))
                          }
                        />
                        <Select
                          value={consultForm.asaRisk}
                          onValueChange={(value) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...consultForm, asaRisk: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASA_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={consultForm.clearanceStatus}
                          onValueChange={(value: AnesthesiaClearanceStatus) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...consultForm, clearanceStatus: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">În așteptare</SelectItem>
                            <SelectItem value="cleared">Apt operator</SelectItem>
                            <SelectItem value="conditional">Apt cu condiții</SelectItem>
                            <SelectItem value="denied">Contraindicat momentan</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={consultForm.airwayAssessment}
                          onChange={(event) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...consultForm, airwayAssessment: event.target.value },
                            }))
                          }
                          placeholder="Airway / Mallampati / intubație dificilă"
                        />
                        <Select
                          value={consultForm.fastingConfirmed}
                          onValueChange={(value) =>
                            setConsultForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...consultForm, fastingConfirmed: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Repauz alimentar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Repauz confirmat</SelectItem>
                            <SelectItem value="no">Repauz neconfirmat</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="md:col-span-2">
                          <Textarea
                            rows={3}
                            value={consultForm.recommendations}
                            onChange={(event) =>
                              setConsultForms((prev) => ({
                                ...prev,
                                [caseItem.$id]: { ...consultForm, recommendations: event.target.value },
                              }))
                            }
                            placeholder="Ex: consult cardiologic suplimentar, profilaxie antibiotică, rezervă sânge."
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={() => handleConsultSubmit(caseItem.$id)}
                          disabled={savingConsultCaseId === caseItem.$id}
                        >
                          {savingConsultCaseId === caseItem.$id ? "Se salvează..." : "Salvează consult ATI"}
                        </Button>
                        {anesthesiaConsult && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Ultima actualizare: {formatDateTime(anesthesiaConsult.updatedAt).dateTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Programare bloc operator</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {booking
                            ? `${booking.room?.roomNumber || "Sală"} · ${formatDateTime(booking.scheduledStart).dateTime}`
                            : "Așteaptă rezervarea unei săli de către administrație."}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Situație financiară</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {financial
                            ? `Acoperire: ${financial.coverageType} · Plata: ${financial.paymentStatus}`
                            : "Decontarea CASS / plata pacientului nu a fost completată încă."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
