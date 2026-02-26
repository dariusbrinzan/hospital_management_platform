"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Doctors } from "@/constants";
import Image from "next/image";
import { Clock, User, Activity } from "lucide-react";
import { formatEmergencyCaseNumber, getWaitingMinutes, formatWaitingTime, formatDateTime } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { TriageForm } from "./forms/TriageForm";
import { ConsentForm } from "./forms/ConsentForm";
import { CarePlanForm } from "./forms/CarePlanForm";
import { DischargeForm } from "./forms/DischargeForm";
import { EmergencyImagingSection } from "./EmergencyImagingSection";

type EmergencyState = "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge";

type StateTransitionRow = {
  $id: string;
  fromState: string;
  toState: string;
  transitionReason: string | null;
  performedBy: string;
  timestamp: string | Date | null;
};

interface EmergencyCaseDetailsProps {
  emergencyCase: EmergencyCase;
  imagingStudies?: any[];
  stateTransitions?: StateTransitionRow[];
}

const stateLabels: Record<EmergencyState, string> = {
  arrival: "Prezentare",
  triage: "Triaj",
  consent: "Consimțământ",
  admission: "Internare",
  treatment: "Tratament",
  icu: "ATI",
  discharge: "Externare",
};

export const EmergencyCaseDetails = ({ emergencyCase, imagingStudies = [], stateTransitions = [] }: EmergencyCaseDetailsProps) => {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<EmergencyState | null>(null);
  const doctor = emergencyCase.assignedDoctorId
    ? Doctors.find((d) => d.name === emergencyCase.assignedDoctorId)
    : null;
  const caseNumber = formatEmergencyCaseNumber(emergencyCase.$id);
  const waitingMinutes =
    emergencyCase.currentState !== "discharge" && emergencyCase.arrivalTime
      ? getWaitingMinutes(emergencyCase.arrivalTime)
      : null;

  const priorityColors: Record<number, string> = {
    1: "bg-red-600 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-amber-500 text-white",
    4: "bg-slate-500 text-white",
    5: "bg-slate-400 text-white",
  };

  const handleStateTransition = async (newState: EmergencyState, skipReason?: string) => {
    try {
      const response = await fetch(`/api/emergency/${emergencyCase.$id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newState, performedBy: "Admin", skipReason }),
      });
      if (response.ok) {
        router.refresh();
        setActiveForm(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la tranziția de stare");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare la tranziția de stare");
    }
  };

  const uniqueTransitions = stateTransitions.filter((t, i) => i === 0 || t.toState !== stateTransitions[i - 1]?.toState);

  return (
    <div className="space-y-6">
      {/* Card: Pacient + status + medic */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{caseNumber}</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {emergencyCase.patient?.name || (emergencyCase as any).patientName || "Pacient necunoscut"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{emergencyCase.chiefComplaint}</p>
                {!emergencyCase.patient && ((emergencyCase as any).patientPhone || (emergencyCase as any).patientAge) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {(emergencyCase as any).patientPhone && `Tel: ${(emergencyCase as any).patientPhone}`}
                    {(emergencyCase as any).patientAge && ` · ${(emergencyCase as any).patientAge} ani`}
                    {(emergencyCase as any).patientGender && ` · ${(emergencyCase as any).patientGender}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${priorityColors[emergencyCase.priority as keyof typeof priorityColors] ?? priorityColors[5]}`}>
                P{emergencyCase.priority}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {stateLabels[emergencyCase.currentState]}
              </span>
              {waitingMinutes !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <Clock className="size-4" />
                  Așteptare: {formatWaitingTime(waitingMinutes)}
                </span>
              )}
            </div>
          </div>
          {doctor && (
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="size-10 overflow-hidden rounded-full border-2 border-teal-500">
                <Image src={doctor.image} width={40} height={40} alt="" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{doctor.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.specialty}</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 border-t border-slate-100 text-sm dark:border-slate-800 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nivel triaj</p>
            <p className="font-semibold capitalize text-slate-900 dark:text-slate-100">{emergencyCase.triageLevel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Prezentare</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {emergencyCase.arrivalTime ? formatDateTime(emergencyCase.arrivalTime).dateTime : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Consimțământ</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.consentGiven ? "Da" : "Nu"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stare curentă</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{stateLabels[emergencyCase.currentState]}</p>
          </div>
        </CardContent>
      </Card>

      {/* Istoric tranziții */}
      {uniqueTransitions.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Activity className="size-4" />
              Istoric mișcări
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {uniqueTransitions.map((t) => (
                <li key={t.$id} className="flex flex-wrap items-baseline gap-2 border-l-2 border-teal-200 pl-3 dark:border-teal-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.timestamp ? formatDateTime(t.timestamp).dateTime : "—"}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {stateLabels[t.fromState as EmergencyState]} → {stateLabels[t.toState as EmergencyState]}
                  </span>
                  {t.transitionReason && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">· {t.transitionReason}</span>
                  )}
                  <span className="text-xs text-slate-400">({t.performedBy})</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Semne vitale */}
      {emergencyCase.vitalSigns && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Semne vitale</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {emergencyCase.vitalSigns.bloodPressure && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tensiune</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.vitalSigns.bloodPressure}</p>
                </div>
              )}
              {emergencyCase.vitalSigns.pulse && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Puls</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.vitalSigns.pulse} bpm</p>
                </div>
              )}
              {emergencyCase.vitalSigns.temperature && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Temperatură</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.vitalSigns.temperature}°C</p>
                </div>
              )}
              {emergencyCase.vitalSigns.oxygenSaturation && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sat O2</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.vitalSigns.oxygenSaturation}%</p>
                </div>
              )}
              {emergencyCase.vitalSigns.respiratoryRate && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Frecv. resp.</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{emergencyCase.vitalSigns.respiratoryRate}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acțiuni */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Acțiuni</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {emergencyCase.currentState === "arrival" && (
              <Button onClick={() => setActiveForm("triage")} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                Efectuează triaj
              </Button>
            )}
            {emergencyCase.currentState === "triage" && (
              <>
                <Button onClick={() => setActiveForm("consent")} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                  Obține consimțământ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStateTransition("admission", "Trecere directă la internare")}
                  className="rounded-lg border-slate-300 dark:border-slate-600"
                >
                  Internare directă
                </Button>
              </>
            )}
            {emergencyCase.currentState === "consent" && (
              <Button onClick={() => handleStateTransition("admission")} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                Internare
              </Button>
            )}
            {emergencyCase.currentState === "admission" && (
              <>
                <Button onClick={() => handleStateTransition("treatment")} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                  Începe tratament
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!confirm("Transferați pacientul în ATI?")) return;
                    try {
                      const res = await fetch(`/api/emergency/${emergencyCase.$id}/icu`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ diagnosis: emergencyCase.chiefComplaint, assignedDoctorId: emergencyCase.assignedDoctorId }),
                      });
                      if (res.ok) {
                        toast.success("Transfer în ATI reușit");
                        router.refresh();
                      } else {
                        const err = await res.json();
                        toast.error(err.error || "Eroare la transfer");
                      }
                    } catch {
                      toast.error("Eroare la transferul în ATI");
                    }
                  }}
                  className="rounded-lg border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                >
                  Transfer în ATI
                </Button>
              </>
            )}
            {emergencyCase.currentState === "treatment" && (
              <>
                <Button onClick={() => setActiveForm("discharge")} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                  Externare
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!confirm("Transferați pacientul în ATI?")) return;
                    try {
                      const res = await fetch(`/api/emergency/${emergencyCase.$id}/icu`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ diagnosis: emergencyCase.chiefComplaint, assignedDoctorId: emergencyCase.assignedDoctorId }),
                      });
                      if (res.ok) {
                        toast.success("Transfer în ATI reușit");
                        router.refresh();
                      } else {
                        const err = await res.json();
                        toast.error(err.error || "Eroare la transfer");
                      }
                    } catch {
                      toast.error("Eroare la transferul în ATI");
                    }
                  }}
                  className="rounded-lg border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                >
                  Transfer în ATI
                </Button>
              </>
            )}
            {emergencyCase.currentState === "icu" && (
              <Button asChild className="rounded-lg bg-teal-600 hover:bg-teal-700">
                <a href="/admin/icu">Vezi în Dashboard ATI</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investigații imagistice (flux urgență) */}
      <EmergencyImagingSection
        caseId={emergencyCase.$id}
        patientId={(emergencyCase as any).patientId ?? emergencyCase.patient?.$id}
        patientName={emergencyCase.patient?.name || (emergencyCase as any).patientName}
        initialStudies={imagingStudies}
      />

      {/* Formulare pentru fiecare etapă */}
      {activeForm === "triage" && (
        <TriageForm
          emergencyCase={emergencyCase}
          onComplete={() => {
            handleStateTransition("triage");
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {activeForm === "consent" && (
        <ConsentForm
          emergencyCase={emergencyCase}
          onComplete={() => {
            handleStateTransition("consent");
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {activeForm === "treatment" && (
        <CarePlanForm
          emergencyCase={emergencyCase}
          onComplete={() => {
            handleStateTransition("treatment");
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {activeForm === "discharge" && (
        <DischargeForm
          emergencyCase={emergencyCase}
          onComplete={() => {
            handleStateTransition("discharge");
            setActiveForm(null);
          }}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {/* Plan de îngrijire */}
      {emergencyCase.carePlan && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Plan de îngrijire</h3>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{emergencyCase.carePlan}</p>
          </CardContent>
        </Card>
      )}

      {/* Scrisoare externare */}
      {emergencyCase.dischargeLetter && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Scrisoare medicală la externare</h3>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{emergencyCase.dischargeLetter}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
