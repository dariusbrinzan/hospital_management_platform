"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { formatDateTime } from "@/lib/utils";

interface HospitalAdmissionModalProps {
  admission: HospitalAdmission;
  onClose: () => void;
}

export const HospitalAdmissionModal = ({ admission, onClose }: HospitalAdmissionModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "treatments" | "procedures">("overview");
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "overview") {
      loadTabData();
    }
  }, [activeTab, admission.$id]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "vitals"
        ? `/api/hospital/admissions/${admission.$id}/vital-signs`
        : activeTab === "treatments"
        ? `/api/hospital/admissions/${admission.$id}/treatments`
        : `/api/hospital/admissions/${admission.$id}/procedures`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (activeTab === "vitals") setVitalSigns(data);
        else if (activeTab === "treatments") setTreatments(data);
        else setProcedures(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/hospital/admissions/${admission.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert("Status actualizat cu succes!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Eroare la actualizarea statusului");
    }
  };

  const handleDischarge = async () => {
    const instructions = prompt("Instrucțiuni de externare (opțional):");
    if (instructions === null) return; // User cancelled

    if (!confirm("Sunteți sigur că doriți să externați pacientul?")) {
      return;
    }

    try {
      const response = await fetch(`/api/hospital/admissions/${admission.$id}/discharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dischargeInstructions: instructions || undefined }),
      });

      if (response.ok) {
        alert("Pacientul a fost externat cu succes!");
        onClose();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la externare");
      }
    } catch (error) {
      console.error("Error discharging patient:", error);
      alert("Eroare la externarea pacientului");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "admitted":
        return "bg-blue-500 text-white";
      case "stable":
        return "bg-green-500 text-white";
      case "improving":
        return "bg-emerald-500 text-white";
      case "ready_for_discharge":
        return "bg-yellow-500 text-white";
      case "discharged":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "admitted":
        return "Internat";
      case "stable":
        return "Stabil";
      case "improving":
        return "În îmbunătățire";
      case "ready_for_discharge":
        return "Gata externare";
      case "discharged":
        return "Externat";
      default:
        return status;
    }
  };

  const daysAdmitted = Math.floor(
    (new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalii Internare - {admission.patientName}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(admission.status)}`}>
              {getStatusLabel(admission.status)}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-dark-200 mb-4">
          {[
            { id: "overview", label: "Prezentare generală" },
            { id: "vitals", label: "Semne vitale" },
            { id: "treatments", label: "Tratamente" },
            { id: "procedures", label: "Proceduri" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-14-medium transition ${
                activeTab === tab.id
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-dark-600 hover:text-dark-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Informații de bază */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-12-regular text-dark-500">Pacient</p>
                <p className="text-14-semibold text-dark-900">{admission.patientName}</p>
              </div>
              <div>
                <p className="text-12-regular text-dark-500">Sală / Pat</p>
                <p className="text-14-semibold text-dark-900">
                  {admission.room?.roomNumber} / Pat {admission.bedNumber}
                </p>
              </div>
              <div>
                <p className="text-12-regular text-dark-500">Data internării</p>
                <p className="text-14-semibold text-dark-900">
                  {formatDateTime(admission.admissionDate).dateTime}
                </p>
              </div>
              <div>
                <p className="text-12-regular text-dark-500">Zile internat</p>
                <p className="text-14-semibold text-dark-900">{daysAdmitted} zile</p>
              </div>
              <div>
                <p className="text-12-regular text-dark-500">Medic internare</p>
                <p className="text-14-semibold text-dark-900">{admission.admittingDoctor}</p>
              </div>
              {admission.assignedDoctor && (
                <div>
                  <p className="text-12-regular text-dark-500">Medic responsabil</p>
                  <p className="text-14-semibold text-dark-900">{admission.assignedDoctor}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-12-regular text-dark-500">Motiv internare</p>
                <p className="text-14-semibold text-dark-900">{admission.admissionReason}</p>
              </div>
              {admission.diagnosis && (
                <div className="col-span-2">
                  <p className="text-12-regular text-dark-500">Diagnostic</p>
                  <p className="text-14-semibold text-dark-900">{admission.diagnosis}</p>
                </div>
              )}
              {admission.expectedLengthOfStay && (
                <div>
                  <p className="text-12-regular text-dark-500">Durată estimată</p>
                  <p className="text-14-semibold text-dark-900">{admission.expectedLengthOfStay} zile</p>
                </div>
              )}
            </div>

            {/* Acțiuni */}
            <div className="flex gap-2 pt-4 border-t border-dark-200">
              <select
                value={admission.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-dark-200 text-14-regular"
              >
                <option value="admitted">Internat</option>
                <option value="stable">Stabil</option>
                <option value="improving">În îmbunătățire</option>
                <option value="ready_for_discharge">Gata externare</option>
              </select>
              <Button
                onClick={handleDischarge}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Externează pacientul
              </Button>
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <div>
            {loading ? (
              <p className="text-center py-8">Se încarcă...</p>
            ) : vitalSigns.length === 0 ? (
              <p className="text-center py-8 text-dark-500">Nu există semne vitale înregistrate.</p>
            ) : (
              <div className="space-y-3">
                {vitalSigns.map((vs) => (
                  <div key={vs.$id} className="border border-dark-200 rounded-lg p-4">
                    <p className="text-12-regular text-dark-500 mb-2">
                      {formatDateTime(vs.recordedAt).dateTime}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {vs.bloodPressureSystolic && (
                        <div>
                          <span className="text-dark-500">TA: </span>
                          <span className="font-semibold">
                            {vs.bloodPressureSystolic}/{vs.bloodPressureDiastolic} mmHg
                          </span>
                        </div>
                      )}
                      {vs.pulse && (
                        <div>
                          <span className="text-dark-500">Puls: </span>
                          <span className="font-semibold">{vs.pulse} bpm</span>
                        </div>
                      )}
                      {vs.temperature && (
                        <div>
                          <span className="text-dark-500">Temp: </span>
                          <span className="font-semibold">{vs.temperature}°C</span>
                        </div>
                      )}
                      {vs.oxygenSaturation && (
                        <div>
                          <span className="text-dark-500">SpO2: </span>
                          <span className="font-semibold">{vs.oxygenSaturation}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "treatments" && (
          <div>
            {loading ? (
              <p className="text-center py-8">Se încarcă...</p>
            ) : treatments.length === 0 ? (
              <p className="text-center py-8 text-dark-500">Nu există tratamente înregistrate.</p>
            ) : (
              <div className="space-y-3">
                {treatments.map((t) => (
                  <div key={t.$id} className="border border-dark-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-16-semibold">{t.medicationName}</p>
                        <p className="text-14-regular text-dark-600">
                          {t.dosage} • {t.frequency}
                        </p>
                        {t.route && <p className="text-12-regular text-dark-500">Cale: {t.route}</p>}
                        {t.notes && <p className="text-12-regular text-dark-500 mt-1">{t.notes}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {t.status === "active" ? "Activ" : "Finalizat"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "procedures" && (
          <div>
            {loading ? (
              <p className="text-center py-8">Se încarcă...</p>
            ) : procedures.length === 0 ? (
              <p className="text-center py-8 text-dark-500">Nu există proceduri înregistrate.</p>
            ) : (
              <div className="space-y-3">
                {procedures.map((p) => (
                  <div key={p.$id} className="border border-dark-200 rounded-lg p-4">
                    <p className="text-16-semibold">{p.procedureName}</p>
                    <p className="text-14-regular text-dark-600">
                      {formatDateTime(p.procedureDate).dateTime}
                    </p>
                    <p className="text-14-regular text-dark-600">Efectuat de: {p.performedBy}</p>
                    {p.outcome && (
                      <p className="text-14-regular text-dark-600 mt-1">Rezultat: {p.outcome}</p>
                    )}
                    {p.notes && <p className="text-12-regular text-dark-500 mt-1">{p.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
