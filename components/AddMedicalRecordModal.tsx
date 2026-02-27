"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Appointment } from "@/types/appwrite.types";
import { toast } from "sonner";

interface AddMedicalRecordModalProps {
  appointment: Appointment;
  doctorName: string;
  triggerClassName?: string;
}

export const AddMedicalRecordModal = ({ appointment, doctorName, triggerClassName }: AddMedicalRecordModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Consultație, 2: Diagnosticuri, 3: Rețete, 4: Semne vitale
  const [existingRecord, setExistingRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [subjectiveNotes, setSubjectiveNotes] = useState("");
  const [objectiveFindings, setObjectiveFindings] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  // Diagnostic state
  const [diagnoses, setDiagnoses] = useState<Array<{
    $id?: string;
    diagnosisName: string;
    diagnosisCode: string;
    diagnosisType: string;
    status: string;
    notes: string;
  }>>([]);
  const [newDiagnosis, setNewDiagnosis] = useState({
    diagnosisName: "",
    diagnosisCode: "",
    diagnosisType: "primary",
    status: "active",
    notes: "",
  });

  // Prescription state
  const [prescriptions, setPrescriptions] = useState<Array<{
    $id?: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string;
    quantity: string;
    instructions: string;
    refills: number;
  }>>([]);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    route: "oral",
    quantity: "",
    instructions: "",
    refills: 0,
  });

  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    pulse: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    weight: "",
    height: "",
    glucoseLevel: "",
  });

  // Resetează și încarcă datele la fiecare deschidere
  useEffect(() => {
    if (!open) return;

    setStep(1);

    const loadRecord = async () => {
      try {
        const response = await fetch(`/api/medical-records/by-appointment/${appointment.$id}`);
        if (response.ok) {
          const record = await response.json();
          if (record) {
            setExistingRecord(record);
            setIsEditMode(true);
            setChiefComplaint(record.chiefComplaint || "");
            setSubjectiveNotes(record.subjectiveNotes || "");
            setObjectiveFindings(record.objectiveFindings || "");
            setAssessment(record.assessment || "");
            setPlan(record.plan || "");
            setDiagnoses(record.diagnoses || []);
            setPrescriptions(
              (record.prescriptions || []).map((p: any) => ({
                $id: p.$id,
                medicationName: p.medicationName || "",
                dosage: p.dosage || "",
                frequency: p.frequency || "",
                route: p.route || "oral",
                quantity: p.quantity || "",
                instructions: p.instructions || "",
                refills: p.refills ?? 0,
              }))
            );
            if (record.vitalSigns) {
              setVitalSigns({
                bloodPressureSystolic: record.vitalSigns.bloodPressureSystolic?.toString() || "",
                bloodPressureDiastolic: record.vitalSigns.bloodPressureDiastolic?.toString() || "",
                pulse: record.vitalSigns.pulse?.toString() || "",
                temperature: record.vitalSigns.temperature?.toString() || "",
                oxygenSaturation: record.vitalSigns.oxygenSaturation?.toString() || "",
                respiratoryRate: record.vitalSigns.respiratoryRate?.toString() || "",
                weight: record.vitalSigns.weight?.toString() || "",
                height: record.vitalSigns.height?.toString() || "",
                glucoseLevel: record.vitalSigns.glucoseLevel?.toString() || "",
              });
            } else {
              setVitalSigns({
                bloodPressureSystolic: "",
                bloodPressureDiastolic: "",
                pulse: "",
                temperature: "",
                oxygenSaturation: "",
                respiratoryRate: "",
                weight: "",
                height: "",
                glucoseLevel: "",
              });
            }
            return;
          }
        }
        // No existing record – reset to fresh state
        setExistingRecord(null);
        setIsEditMode(false);
        setChiefComplaint("");
        setSubjectiveNotes("");
        setObjectiveFindings("");
        setAssessment("");
        setPlan("");
        setDiagnoses([]);
        setPrescriptions([]);
        setVitalSigns({
          bloodPressureSystolic: "",
          bloodPressureDiastolic: "",
          pulse: "",
          temperature: "",
          oxygenSaturation: "",
          respiratoryRate: "",
          weight: "",
          height: "",
          glucoseLevel: "",
        });
      } catch (error) {
        console.error("Error checking existing record:", error);
      }
    };

    loadRecord();
  }, [open, appointment.$id]);

  const addDiagnosis = () => {
    if (!newDiagnosis.diagnosisName) return;
    setDiagnoses([...diagnoses, { ...newDiagnosis }]);
    setNewDiagnosis({
      diagnosisName: "",
      diagnosisCode: "",
      diagnosisType: "primary",
      status: "active",
      notes: "",
    });
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const addPrescription = () => {
    if (!newPrescription.medicationName || !newPrescription.dosage || !newPrescription.frequency) return;
    setPrescriptions([...prescriptions, { ...newPrescription }]);
    setNewPrescription({
      medicationName: "",
      dosage: "",
      frequency: "",
      route: "oral",
      quantity: "",
      instructions: "",
      refills: 0,
    });
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Auto-adaugă rețeta din formular dacă utilizatorul a completat dar n-a apăsat „Adaugă"
    let finalPrescriptions = [...prescriptions];
    if (newPrescription.medicationName && newPrescription.dosage && newPrescription.frequency) {
      finalPrescriptions.push({ ...newPrescription });
    }

    // Auto-adaugă diagnosticul din formular dacă există
    let finalDiagnoses = [...diagnoses];
    if (newDiagnosis.diagnosisName) {
      finalDiagnoses.push({ ...newDiagnosis });
    }

    try {
      let recordId: string;

      if (isEditMode && existingRecord) {
        const updateResponse = await fetch(`/api/medical-records/${existingRecord.$id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chiefComplaint,
            subjectiveNotes,
            objectiveFindings,
            assessment,
            plan,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error("Eroare la actualizarea înregistrării medicale");
        }

        recordId = existingRecord.$id;

        // Șterge diagnosticele și rețetele vechi, apoi re-creează tot
        await fetch(`/api/medical-records/${recordId}/diagnoses`, { method: "DELETE" });
        await fetch(`/api/medical-records/${recordId}/prescriptions`, { method: "DELETE" });
      } else {
        const recordResponse = await fetch("/api/medical-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: appointment.patient.$id,
            appointmentId: appointment.$id,
            doctorName,
            recordType: "consultation",
            visitDate: appointment.schedule,
            chiefComplaint,
            subjectiveNotes,
            objectiveFindings,
            assessment,
            plan,
          }),
        });

        if (!recordResponse.ok) {
          throw new Error("Eroare la crearea înregistrării medicale");
        }

        const record = await recordResponse.json();
        recordId = record.$id;
      }

      // Adaugă toate diagnosticele (fresh, fără $id check)
      for (const diagnosis of finalDiagnoses) {
        const res = await fetch(`/api/medical-records/${recordId}/diagnoses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagnosisName: diagnosis.diagnosisName,
            diagnosisCode: diagnosis.diagnosisCode,
            diagnosisType: diagnosis.diagnosisType,
            status: diagnosis.status,
            notes: diagnosis.notes,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Failed to save diagnosis:", err);
        }
      }

      // Adaugă toate rețetele (fresh, fără $id check)
      for (const prescription of finalPrescriptions) {
        const res = await fetch(`/api/medical-records/${recordId}/prescriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            route: prescription.route,
            quantity: prescription.quantity,
            instructions: prescription.instructions,
            refills: prescription.refills || 0,
            startDate: appointment.schedule,
            status: "active",
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Failed to save prescription:", err);
        }
      }

      // Adaugă semnele vitale (dacă există)
      const hasVitalSigns = Object.values(vitalSigns).some((v) => v !== "");
      if (hasVitalSigns) {
        await fetch(`/api/medical-records/${recordId}/vital-signs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bloodPressureSystolic: vitalSigns.bloodPressureSystolic ? parseInt(vitalSigns.bloodPressureSystolic) : null,
            bloodPressureDiastolic: vitalSigns.bloodPressureDiastolic ? parseInt(vitalSigns.bloodPressureDiastolic) : null,
            pulse: vitalSigns.pulse ? parseInt(vitalSigns.pulse) : null,
            temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : null,
            oxygenSaturation: vitalSigns.oxygenSaturation ? parseInt(vitalSigns.oxygenSaturation) : null,
            respiratoryRate: vitalSigns.respiratoryRate ? parseInt(vitalSigns.respiratoryRate) : null,
            weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : null,
            height: vitalSigns.height ? parseFloat(vitalSigns.height) : null,
            glucoseLevel: vitalSigns.glucoseLevel ? parseFloat(vitalSigns.glucoseLevel) : null,
          }),
        });
      }

      setOpen(false);
      router.refresh();

      const parts: string[] = [];
      if (finalDiagnoses.length > 0) parts.push(`${finalDiagnoses.length} diagnostic(e)`);
      if (finalPrescriptions.length > 0) parts.push(`${finalPrescriptions.length} rețetă(e)`);
      const extra = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      toast.success(
        isEditMode
          ? `Consultație actualizată cu succes!${extra}`
          : `Consultație adăugată cu succes!${extra}`
      );
    } catch (error: any) {
      console.error("Error saving medical record:", error);
      toast.error("Eroare la salvarea consultației: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`rounded-lg text-sm font-medium ${triggerClassName ?? "shad-primary-btn text-14-medium"}`}
        >
          {isEditMode ? "Editează consultație" : "Raport consultație"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează Consultație Medicală" : "Adaugă Consultație Medicală"}</DialogTitle>
          <DialogDescription>
            Pacient: {appointment.patient.name} • Data: {new Date(appointment.schedule).toLocaleDateString("ro-RO")}
            {isEditMode && <span className="block mt-1 text-green-600">✓ Consultație existentă - modul editare</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Consultație de bază */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="chiefComplaint">Motiv consultație *</Label>
                <Input
                  id="chiefComplaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="ex: Durere de cap persistentă"
                />
              </div>

              <div>
                <Label htmlFor="subjectiveNotes">Note subiective (simptome raportate)</Label>
                <Textarea
                  id="subjectiveNotes"
                  value={subjectiveNotes}
                  onChange={(e) => setSubjectiveNotes(e.target.value)}
                  placeholder="Pacientul raportează..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="objectiveFindings">Observații clinice</Label>
                <Textarea
                  id="objectiveFindings"
                  value={objectiveFindings}
                  onChange={(e) => setObjectiveFindings(e.target.value)}
                  placeholder="Examinare fizică:..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessment">Evaluare medicală</Label>
                <Textarea
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Diagnostic presupus:..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="plan">Plan de tratament</Label>
                <Textarea
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Recomandări, tratament, urmărire..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setStep(2)} className="shad-primary-btn">
                  Următorul pas →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Diagnosticuri */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-18-semibold">Diagnosticuri</h3>

              {diagnoses.length > 0 && (
                <div className="space-y-2">
                  {diagnoses.map((d, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                      <div>
                        <p className="text-14-semibold">{d.diagnosisName}</p>
                        {d.diagnosisCode && <p className="text-12-regular text-dark-500">Cod: {d.diagnosisCode}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDiagnosis(index)}
                        className="text-red-600"
                      >
                        Șterge
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nume diagnostic *</Label>
                    <Input
                      value={newDiagnosis.diagnosisName}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosisName: e.target.value })}
                      placeholder="ex: Hipertensiune arterială"
                    />
                  </div>
                  <div>
                    <Label>Cod (ICD-10)</Label>
                    <Input
                      value={newDiagnosis.diagnosisCode}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosisCode: e.target.value })}
                      placeholder="ex: I10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tip</Label>
                    <select
                      value={newDiagnosis.diagnosisType}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosisType: e.target.value })}
                      className="w-full rounded-md border border-dark-300 px-3 py-2"
                    >
                      <option value="primary">Primar</option>
                      <option value="secondary">Secundar</option>
                      <option value="differential">Diferențial</option>
                      <option value="rule_out">Excludere</option>
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={newDiagnosis.status}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, status: e.target.value })}
                      className="w-full rounded-md border border-dark-300 px-3 py-2"
                    >
                      <option value="active">Activ</option>
                      <option value="resolved">Rezolvat</option>
                      <option value="chronic">Cronic</option>
                      <option value="history">Istoric</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Note</Label>
                  <Textarea
                    value={newDiagnosis.notes}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, notes: e.target.value })}
                    placeholder="Note suplimentare..."
                    rows={2}
                  />
                </div>

                <Button onClick={addDiagnosis} className="shad-primary-btn" disabled={!newDiagnosis.diagnosisName}>
                  + Adaugă diagnostic
                </Button>
              </div>

              <div className="flex justify-between gap-2">
                <Button onClick={() => setStep(1)} variant="outline">
                  ← Înapoi
                </Button>
                <Button
                  onClick={() => {
                    if (newDiagnosis.diagnosisName) {
                      addDiagnosis();
                    }
                    setStep(3);
                  }}
                  className="shad-primary-btn"
                >
                  Următorul pas →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Rețete */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-18-semibold">Rețete</h3>
              <p className="text-sm text-slate-500">
                Completează câmpurile și apasă „Adaugă rețetă". Poți adăuga mai multe rețete. La pasul următor se salvează automat.
              </p>

              {prescriptions.length > 0 && (
                <div className="space-y-2">
                  {prescriptions.map((p, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                      <div>
                        <p className="text-14-semibold">{p.medicationName}</p>
                        <p className="text-12-regular text-dark-500">
                          {p.dosage} • {p.frequency}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrescription(index)}
                        className="text-red-600"
                      >
                        Șterge
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nume medicament *</Label>
                    <Input
                      value={newPrescription.medicationName}
                      onChange={(e) => setNewPrescription({ ...newPrescription, medicationName: e.target.value })}
                      placeholder="ex: Amlodipină"
                    />
                  </div>
                  <div>
                    <Label>Doza *</Label>
                    <Input
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                      placeholder="ex: 5mg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Frecvență *</Label>
                    <Input
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                      placeholder="ex: 1x pe zi"
                    />
                  </div>
                  <div>
                    <Label>Cale administrare</Label>
                    <select
                      value={newPrescription.route}
                      onChange={(e) => setNewPrescription({ ...newPrescription, route: e.target.value })}
                      className="w-full rounded-md border border-dark-300 px-3 py-2"
                    >
                      <option value="oral">Oral</option>
                      <option value="injection">Injectabil</option>
                      <option value="topical">Topic</option>
                      <option value="inhalation">Inhalație</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cantitate</Label>
                    <Input
                      value={newPrescription.quantity}
                      onChange={(e) => setNewPrescription({ ...newPrescription, quantity: e.target.value })}
                      placeholder="ex: 30 comprimate"
                    />
                  </div>
                  <div>
                    <Label>Reînnoiri</Label>
                    <Input
                      type="number"
                      value={newPrescription.refills}
                      onChange={(e) => setNewPrescription({ ...newPrescription, refills: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <Label>Instrucțiuni</Label>
                  <Textarea
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                    placeholder="ex: Luare dimineața, înainte de masă"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={addPrescription}
                  className="shad-primary-btn"
                  disabled={!newPrescription.medicationName || !newPrescription.dosage || !newPrescription.frequency}
                >
                  + Adaugă rețetă
                </Button>
              </div>

              <div className="flex justify-between gap-2">
                <Button onClick={() => setStep(2)} variant="outline">
                  ← Înapoi
                </Button>
                <Button
                  onClick={() => {
                    if (newPrescription.medicationName && newPrescription.dosage && newPrescription.frequency) {
                      addPrescription();
                    }
                    setStep(4);
                  }}
                  className="shad-primary-btn"
                >
                  Următorul pas →
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Semne vitale */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-18-semibold">Semne Vitale</h3>
              <p className="text-14-regular text-dark-600">
                Completează doar câmpurile relevante. Câmpurile goale vor fi ignorate.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tensiune sistolică (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.bloodPressureSystolic}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureSystolic: e.target.value })}
                    placeholder="ex: 120"
                  />
                </div>
                <div>
                  <Label>Tensiune diastolică (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.bloodPressureDiastolic}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureDiastolic: e.target.value })}
                    placeholder="ex: 80"
                  />
                </div>
                <div>
                  <Label>Puls (bpm)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.pulse}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                    placeholder="ex: 72"
                  />
                </div>
                <div>
                  <Label>Temperatură (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                    placeholder="ex: 36.5"
                  />
                </div>
                <div>
                  <Label>Saturație oxigen (%)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.oxygenSaturation}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                    placeholder="ex: 98"
                  />
                </div>
                <div>
                  <Label>Frecvență respiratorie (resp/min)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.respiratoryRate}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                    placeholder="ex: 16"
                  />
                </div>
                <div>
                  <Label>Greutate (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                    placeholder="ex: 75"
                  />
                </div>
                <div>
                  <Label>Înălțime (cm)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.height}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                    placeholder="ex: 175"
                  />
                </div>
                <div>
                  <Label>Glicemie (mg/dL)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.glucoseLevel}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, glucoseLevel: e.target.value })}
                    placeholder="ex: 95"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button onClick={() => setStep(3)} variant="outline">
                  ← Înapoi
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="shad-primary-btn"
                  disabled={loading || !chiefComplaint}
                >
                  {loading ? "Se salvează..." : "✅ Salvează Consultația"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
