"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { AddVitalSignsForm } from "./forms/AddVitalSignsForm";
import { AddTreatmentForm } from "./forms/AddTreatmentForm";

interface ICUVitalSignsRecord {
  $id: string;
  recordedAt: string;
  recordedBy?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  glucoseLevel?: number;
  consciousnessLevel?: string;
  notes?: string;
}

interface ICUTreatmentRecord {
  $id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  administeredBy?: string;
  notes?: string;
}

interface ICUPatientModalProps {
  patient: ICUPatient;
  onClose: () => void;
}

export const ICUPatientModal = ({ patient, onClose }: ICUPatientModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "treatments">("overview");
  const [vitalSigns, setVitalSigns] = useState<ICUVitalSignsRecord[]>([]);
  const [treatments, setTreatments] = useState<ICUTreatmentRecord[]>([]);
  const [showVitalSignsForm, setShowVitalSignsForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [patientStatus, setPatientStatus] = useState(patient.status);

  useEffect(() => {
    loadData();
  }, [patient.$id]);

  const loadData = async () => {
    try {
      const [vitalsRes, treatmentsRes] = await Promise.all([
        fetch(`/api/icu/patients/${patient.$id}/vital-signs?limit=10`),
        fetch(`/api/icu/patients/${patient.$id}/treatments`),
      ]);

      if (vitalsRes.ok) {
        const vitals = await vitalsRes.json();
        setVitalSigns(vitals);
      }

      if (treatmentsRes.ok) {
        const treats = await treatmentsRes.json();
        setTreatments(treats);
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  };

  const handleStatusChange = async (newStatus: "critical" | "stable" | "improving" | "deteriorating") => {
    try {
      const response = await fetch(`/api/icu/patients/${patient.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPatientStatus(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDischarge = async () => {
    if (!confirm("Sunteți sigur că doriți să externați pacientul din ATI?")) {
      return;
    }

    try {
      const response = await fetch(`/api/icu/patients/${patient.$id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pacientul a fost externat cu succes");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error discharging patient:", error);
      toast.error("Eroare la externarea pacientului");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500 text-white";
      case "deteriorating":
        return "bg-orange-500 text-white";
      case "stable":
        return "bg-yellow-500 text-white";
      case "improving":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {patient.patientName || "Pacient necunoscut"} - Sală {patient.room?.roomNumber}, Pat {patient.bedNumber}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(patientStatus)}`}>
              {patientStatus === "critical" ? "Critic" :
               patientStatus === "deteriorating" ? "În agravare" :
               patientStatus === "stable" ? "Stabil" :
               "În îmbunătățire"}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-dark-600"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Prezentare generală
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "vitals" ? "border-b-2 border-blue-500 text-blue-600" : "text-dark-600"
            }`}
            onClick={() => setActiveTab("vitals")}
          >
            Semne vitale
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "treatments" ? "border-b-2 border-blue-500 text-blue-600" : "text-dark-600"
            }`}
            onClick={() => setActiveTab("treatments")}
          >
            Tratamente
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-12-medium text-dark-500">Nume</label>
                <p className="text-14-regular">{patient.patientName || "N/A"}</p>
              </div>
              <div>
                <label className="text-12-medium text-dark-500">Telefon</label>
                <p className="text-14-regular">{patient.patientPhone || "N/A"}</p>
              </div>
              <div>
                <label className="text-12-medium text-dark-500">Vârstă</label>
                <p className="text-14-regular">{patient.patientAge || "N/A"}</p>
              </div>
              <div>
                <label className="text-12-medium text-dark-500">Gen</label>
                <p className="text-14-regular">{patient.patientGender || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <label className="text-12-medium text-dark-500">Diagnostic</label>
                <p className="text-14-regular">{patient.diagnosis || "N/A"}</p>
              </div>
              <div>
                <label className="text-12-medium text-dark-500">Data internării</label>
                <p className="text-14-regular">
                  {new Date(patient.admissionDate).toLocaleString("ro-RO")}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="text-14-semibold mb-2 block">Status pacient</label>
              <div className="flex gap-2">
                {(["critical", "deteriorating", "stable", "improving"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={patientStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status === "critical" ? "Critic" :
                     status === "deteriorating" ? "În agravare" :
                     status === "stable" ? "Stabil" :
                     "În îmbunătățire"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="destructive" onClick={handleDischarge}>
                Externare din ATI
              </Button>
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-16-semibold">Semne vitale</h3>
              <Button onClick={() => setShowVitalSignsForm(true)}>+ Adaugă semne vitale</Button>
            </div>

            {showVitalSignsForm && (
              <AddVitalSignsForm
                patientId={patient.$id}
                onSuccess={() => {
                  setShowVitalSignsForm(false);
                  loadData();
                }}
                onCancel={() => setShowVitalSignsForm(false)}
              />
            )}

            <div className="space-y-2">
              {vitalSigns.length === 0 ? (
                <p className="text-dark-500 text-center py-4">Nu există semne vitale înregistrate</p>
              ) : (
                vitalSigns.map((vs) => (
                  <div key={vs.$id} className="border rounded p-3">
                    <div className="text-xs text-dark-500 mb-2">
                      {new Date(vs.recordedAt).toLocaleString("ro-RO")} {vs.recordedBy && `• ${vs.recordedBy}`}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {vs.bloodPressureSystolic && vs.bloodPressureDiastolic && (
                        <div>
                          <span className="text-dark-500">TA:</span> {vs.bloodPressureSystolic}/{vs.bloodPressureDiastolic}
                        </div>
                      )}
                      {vs.pulse && (
                        <div>
                          <span className="text-dark-500">Puls:</span> {vs.pulse} bpm
                        </div>
                      )}
                      {vs.temperature && (
                        <div>
                          <span className="text-dark-500">Temp:</span> {vs.temperature}°C
                        </div>
                      )}
                      {vs.oxygenSaturation && (
                        <div>
                          <span className="text-dark-500">SpO2:</span> {vs.oxygenSaturation}%
                        </div>
                      )}
                      {vs.respiratoryRate && (
                        <div>
                          <span className="text-dark-500">FR:</span> {vs.respiratoryRate}/min
                        </div>
                      )}
                      {vs.glucoseLevel && (
                        <div>
                          <span className="text-dark-500">Glicemie:</span> {vs.glucoseLevel} mg/dL
                        </div>
                      )}
                      {vs.consciousnessLevel && (
                        <div>
                          <span className="text-dark-500">Conștiență:</span> {
                            vs.consciousnessLevel === "conscious" ? "Conștient" :
                            vs.consciousnessLevel === "drowsy" ? "Adormit" :
                            "Inconștient"
                          }
                        </div>
                      )}
                    </div>
                    {vs.notes && (
                      <div className="mt-2 text-sm text-dark-600">{vs.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "treatments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-16-semibold">Tratamente</h3>
              <Button onClick={() => setShowTreatmentForm(true)}>+ Adaugă tratament</Button>
            </div>

            {showTreatmentForm && (
              <AddTreatmentForm
                patientId={patient.$id}
                onSuccess={() => {
                  setShowTreatmentForm(false);
                  loadData();
                }}
                onCancel={() => setShowTreatmentForm(false)}
              />
            )}

            <div className="space-y-2">
              {treatments.length === 0 ? (
                <p className="text-dark-500 text-center py-4">Nu există tratamente înregistrate</p>
              ) : (
                treatments.map((t) => (
                  <div key={t.$id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{t.medicationName}</div>
                        <div className="text-sm text-dark-600">
                          {t.dosage} • {t.frequency} {t.route && `• ${t.route}`}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.status === "active" ? "bg-green-100 text-green-800" :
                        t.status === "completed" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {t.status === "active" ? "Activ" :
                         t.status === "completed" ? "Completat" :
                         "Discontinuat"}
                      </span>
                    </div>
                    <div className="text-xs text-dark-500">
                      Început: {t.startTime ? new Date(t.startTime).toLocaleString("ro-RO") : "—"}
                      {t.endTime && ` • Sfârșit: ${new Date(t.endTime).toLocaleString("ro-RO")}`}
                      {t.administeredBy && ` • De: ${t.administeredBy}`}
                    </div>
                    {t.notes && (
                      <div className="mt-2 text-sm text-dark-600">{t.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
