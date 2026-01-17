"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmergencyCase } from "@/types";
import { Doctors } from "@/constants";
import Image from "next/image";
import { Button } from "./ui/button";
import { TriageForm } from "./forms/TriageForm";
import { ConsentForm } from "./forms/ConsentForm";
import { CarePlanForm } from "./forms/CarePlanForm";
import { DischargeForm } from "./forms/DischargeForm";

type EmergencyState = "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge";

interface EmergencyCaseDetailsProps {
  emergencyCase: EmergencyCase;
}

export const EmergencyCaseDetails = ({ emergencyCase }: EmergencyCaseDetailsProps) => {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<EmergencyState | null>(null);
  const doctor = emergencyCase.assignedDoctorId
    ? Doctors.find((d) => d.name === emergencyCase.assignedDoctorId)
    : null;

  const stateLabels: Record<EmergencyState, string> = {
    arrival: "Prezentare",
    triage: "Triaj",
    consent: "Consimțământ",
    admission: "Internare",
    treatment: "Tratament",
    icu: "ATI",
    discharge: "Externare",
  };

  const priorityColors = {
    1: "bg-red-500 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-yellow-500 text-white",
    4: "bg-blue-500 text-white",
    5: "bg-gray-500 text-white",
  };

  const handleStateTransition = async (newState: EmergencyState, skipReason?: string) => {
    try {
      const response = await fetch(`/api/emergency/${emergencyCase.$id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newState,
          performedBy: "Admin", // TODO: Obține numele utilizatorului curent
          skipReason,
        }),
      });

      if (response.ok) {
        router.refresh();
        setActiveForm(null);
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la tranziția de stare");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la tranziția de stare");
    }
  };


  return (
    <div className="space-y-6">
      {/* Header cu informații de bază */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-2xl font-bold">
                {emergencyCase.patient?.name || (emergencyCase as any).patientName || "Pacient necunoscut"}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors[emergencyCase.priority as keyof typeof priorityColors] || priorityColors[5]}`}
              >
                Prioritate {emergencyCase.priority}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {stateLabels[emergencyCase.currentState]}
              </span>
            </div>
            {!emergencyCase.patient && ((emergencyCase as any).patientPhone || (emergencyCase as any).patientAge || (emergencyCase as any).patientGender) && (
              <div className="flex items-center gap-4 mb-2 text-sm text-dark-500">
                {(emergencyCase as any).patientPhone && <span>Tel: {(emergencyCase as any).patientPhone}</span>}
                {(emergencyCase as any).patientAge && <span>Vârstă: {(emergencyCase as any).patientAge} ani</span>}
                {(emergencyCase as any).patientGender && <span>Gen: {(emergencyCase as any).patientGender}</span>}
              </div>
            )}
            <p className="text-dark-600 mb-4">{emergencyCase.chiefComplaint}</p>
          </div>
          {doctor && (
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <div className="size-12 overflow-hidden rounded-full border-2 border-green-500">
                  <Image
                    src={doctor.image}
                    width={48}
                    height={48}
                    alt="doctor"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">{doctor.name}</p>
                <p className="text-xs text-dark-500">{doctor.specialty}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-dark-500">Nivel Triaj</p>
            <p className="font-semibold capitalize">{emergencyCase.triageLevel}</p>
          </div>
          <div>
            <p className="text-dark-500">Ora Prezentării</p>
            <p className="font-semibold">
              {new Date(emergencyCase.arrivalTime).toLocaleTimeString("ro-RO")}
            </p>
          </div>
          <div>
            <p className="text-dark-500">Consimțământ</p>
            <p className="font-semibold">
              {emergencyCase.consentGiven ? "✓ Da" : "✗ Nu"}
            </p>
          </div>
          <div>
            <p className="text-dark-500">Stare Curentă</p>
            <p className="font-semibold">{stateLabels[emergencyCase.currentState]}</p>
          </div>
        </div>
      </div>

      {/* Semne vitale */}
      {emergencyCase.vitalSigns && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Semne Vitale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {emergencyCase.vitalSigns.bloodPressure && (
              <div>
                <p className="text-sm text-dark-500">Tensiune</p>
                <p className="font-semibold">{emergencyCase.vitalSigns.bloodPressure}</p>
              </div>
            )}
            {emergencyCase.vitalSigns.pulse && (
              <div>
                <p className="text-sm text-dark-500">Puls</p>
                <p className="font-semibold">{emergencyCase.vitalSigns.pulse} bpm</p>
              </div>
            )}
            {emergencyCase.vitalSigns.temperature && (
              <div>
                <p className="text-sm text-dark-500">Temperatură</p>
                <p className="font-semibold">{emergencyCase.vitalSigns.temperature}°C</p>
              </div>
            )}
            {emergencyCase.vitalSigns.oxygenSaturation && (
              <div>
                <p className="text-sm text-dark-500">Sat O2</p>
                <p className="font-semibold">{emergencyCase.vitalSigns.oxygenSaturation}%</p>
              </div>
            )}
            {emergencyCase.vitalSigns.respiratoryRate && (
              <div>
                <p className="text-sm text-dark-500">Frecv. Resp.</p>
                <p className="font-semibold">{emergencyCase.vitalSigns.respiratoryRate}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acțiuni disponibile */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Acțiuni</h3>
        <div className="flex flex-wrap gap-2">
          {emergencyCase.currentState === "arrival" && (
            <Button
              onClick={() => setActiveForm("triage")}
              className="shad-primary-btn"
            >
              Efectuează Triaj
            </Button>
          )}
          {emergencyCase.currentState === "triage" && (
            <>
              <Button
                onClick={() => setActiveForm("consent")}
                className="shad-primary-btn"
              >
                Obține Consimțământ
              </Button>
              <Button
                onClick={() => handleStateTransition("admission", "Trecere directă la internare")}
                className="shad-gray-btn"
              >
                Internare Directă
              </Button>
            </>
          )}
          {emergencyCase.currentState === "consent" && (
            <Button
              onClick={() => handleStateTransition("admission")}
              className="shad-primary-btn"
            >
              Internare
            </Button>
          )}
          {emergencyCase.currentState === "admission" && (
            <>
              <Button
                onClick={() => handleStateTransition("treatment")}
                className="shad-primary-btn"
              >
                Începe Tratament
              </Button>
              <Button
                onClick={async () => {
                  if (!confirm("Sunteți sigur că doriți să transferați pacientul în ATI?")) {
                    return;
                  }
                  try {
                    const response = await fetch(`/api/emergency/${emergencyCase.$id}/icu`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        diagnosis: emergencyCase.chiefComplaint,
                        assignedDoctorId: emergencyCase.assignedDoctorId,
                      }),
                    });
                    if (response.ok) {
                      alert("Pacientul a fost transferat în ATI cu succes");
                      router.refresh();
                    } else {
                      const error = await response.json();
                      alert(error.error || "Eroare la transferul în ATI");
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Eroare la transferul în ATI");
                  }
                }}
                className="shad-gray-btn bg-red-600 hover:bg-red-700 text-white"
              >
                Transfer în ATI
              </Button>
            </>
          )}
          {emergencyCase.currentState === "treatment" && (
            <>
              <Button
                onClick={() => setActiveForm("discharge")}
                className="shad-primary-btn"
              >
                Externare
              </Button>
              <Button
                onClick={async () => {
                  if (!confirm("Sunteți sigur că doriți să transferați pacientul în ATI?")) {
                    return;
                  }
                  try {
                    const response = await fetch(`/api/emergency/${emergencyCase.$id}/icu`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        diagnosis: emergencyCase.chiefComplaint,
                        assignedDoctorId: emergencyCase.assignedDoctorId,
                      }),
                    });
                    if (response.ok) {
                      alert("Pacientul a fost transferat în ATI cu succes");
                      router.refresh();
                    } else {
                      const error = await response.json();
                      alert(error.error || "Eroare la transferul în ATI");
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Eroare la transferul în ATI");
                  }
                }}
                className="shad-gray-btn bg-red-600 hover:bg-red-700 text-white"
              >
                Transfer în ATI
              </Button>
            </>
          )}
          {emergencyCase.currentState === "icu" && (
            <Button
              onClick={() => window.location.href = "/admin/icu"}
              className="shad-primary-btn"
            >
              Vezi în Dashboard ATI
            </Button>
          )}
        </div>
      </div>

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
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Plan de Îngrijire</h3>
          <p className="text-dark-700 whitespace-pre-wrap">{emergencyCase.carePlan}</p>
        </div>
      )}

      {/* Scrisoare de externare */}
      {emergencyCase.dischargeLetter && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Scrisoare Medicală la Externare</h3>
          <p className="text-dark-700 whitespace-pre-wrap">{emergencyCase.dischargeLetter}</p>
        </div>
      )}
    </div>
  );
};
