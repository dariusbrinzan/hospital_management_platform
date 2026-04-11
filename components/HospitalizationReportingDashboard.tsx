"use client";

import { ClipboardCheck, FileSpreadsheet, Send, ShieldCheck } from "lucide-react";
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
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  primaryPhysician?: string | null;
};

type AdmissionOption = {
  $id: string;
  patientId?: string | null;
  patientName: string;
  admissionDate: Date | string;
  department: string;
  admittingDoctor: string;
};

type BatchWithItems = {
  batch: HospitalizationReportingBatch;
  items: HospitalizationReportingBatchItem[];
};

interface HospitalizationReportingDashboardProps {
  patients: PatientOption[];
  admissions: AdmissionOption[];
  sheets: Array<HospitalizationSheet & {
    diagnoses: HospitalizationSheetDiagnosis[];
    procedures: HospitalizationSheetProcedure[];
  }>;
  batches: BatchWithItems[];
}

const nowLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

const defaultBatchMonth = String(new Date().getMonth() + 1);
const defaultBatchYear = String(new Date().getFullYear());

function sheetValidationLabel(status: HospitalizationValidationStatus) {
  switch (status) {
    case "valid":
      return "Valid";
    case "invalid":
      return "Invalid";
    default:
      return "Draft";
  }
}

function reportStatusLabel(status: HospitalizationReportStatus) {
  switch (status) {
    case "accepted":
      return "Acceptat";
    case "rejected":
      return "Respins";
    case "submitted":
      return "Trimis";
    case "batched":
      return "În batch";
    default:
      return "Draft";
  }
}

function batchStatusLabel(status: HospitalizationBatchStatus) {
  switch (status) {
    case "validated":
      return "Validat";
    case "submitted":
      return "Trimis";
    case "accepted":
      return "Acceptat";
    case "partially_rejected":
      return "Parțial respins";
    case "rejected":
      return "Respins";
    default:
      return "Draft";
  }
}

function parseLines(
  value: string,
  kind: "diagnosis" | "procedure"
): Array<Record<string, any>> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [codePart, namePart, extraPart] = line.split("|").map((part) => part.trim());
      if (kind === "diagnosis") {
        return {
          diagnosisCode: namePart ? codePart || undefined : undefined,
          diagnosisName: namePart || codePart,
          diagnosisKind: "secondary" as HospitalizationDiagnosisKind,
          presentOnAdmission: extraPart?.toLowerCase() === "da",
        };
      }
      return {
        procedureCode: namePart ? codePart || undefined : undefined,
        procedureName: namePart || codePart,
        procedureKind: "therapeutic" as HospitalizationProcedureKind,
        performer: extraPart || undefined,
      };
    });
}

export function HospitalizationReportingDashboard({
  patients,
  admissions,
  sheets,
  batches,
}: HospitalizationReportingDashboardProps) {
  const router = useRouter();
  const [savingSheet, setSavingSheet] = useState(false);
  const [batchCreating, setBatchCreating] = useState(false);
  const [submittingBatchId, setSubmittingBatchId] = useState<string | null>(null);
  const [validatingSheetId, setValidatingSheetId] = useState<string | null>(null);

  const [sheetForm, setSheetForm] = useState({
    patientId: "",
    admissionId: "none",
    hospitalizationType: "continuous" as HospitalizationSheetType,
    admissionType: "elective",
    insuranceStatus: "insured",
    cnasPayerType: "cass",
    admissionDate: nowLocalDate(),
    dischargeDate: nowLocalDate(),
    admissionSection: "Neurologie",
    dischargeSection: "Neurologie",
    attendingPhysician: "",
    admissionDiagnosis: "",
    mainDiagnosis: "",
    dischargeStatus: "ameliorat",
    dischargeType: "la domiciliu",
    expectedReimbursement: "0",
    notes: "",
    diagnosesText: "",
    proceduresText: "",
  });

  const [batchForm, setBatchForm] = useState({
    month: defaultBatchMonth,
    year: defaultBatchYear,
  });

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.$id === sheetForm.patientId) ?? null,
    [patients, sheetForm.patientId]
  );

  const linkedAdmission = useMemo(
    () =>
      sheetForm.admissionId !== "none"
        ? admissions.find((admission) => admission.$id === sheetForm.admissionId) ?? null
        : null,
    [admissions, sheetForm.admissionId]
  );

  const linkedPatientAdmissions = useMemo(
    () =>
      selectedPatient
        ? admissions.filter((admission) => admission.patientId === selectedPatient.$id)
        : admissions,
    [admissions, selectedPatient]
  );

  const handleCreateSheet = async () => {
    if (!sheetForm.patientId || !sheetForm.attendingPhysician.trim() || !sheetForm.mainDiagnosis.trim()) {
      toast.error("Completează pacientul, medicul curant și diagnosticul principal.");
      return;
    }

    setSavingSheet(true);
    try {
      const response = await fetch("/api/admin/hospitalization-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: sheetForm.patientId,
          admissionId: sheetForm.admissionId !== "none" ? sheetForm.admissionId : null,
          hospitalizationType: sheetForm.hospitalizationType,
          admissionType: sheetForm.admissionType,
          insuranceStatus: sheetForm.insuranceStatus,
          cnasPayerType: sheetForm.cnasPayerType,
          admissionDate: new Date(sheetForm.admissionDate).toISOString(),
          dischargeDate: new Date(sheetForm.dischargeDate).toISOString(),
          admissionSection: sheetForm.admissionSection,
          dischargeSection: sheetForm.dischargeSection,
          attendingPhysician: sheetForm.attendingPhysician,
          admissionDiagnosis: sheetForm.admissionDiagnosis,
          mainDiagnosis: sheetForm.mainDiagnosis,
          dischargeStatus: sheetForm.dischargeStatus,
          dischargeType: sheetForm.dischargeType,
          expectedReimbursement: Number(sheetForm.expectedReimbursement) || 0,
          notes: sheetForm.notes,
          diagnoses: parseLines(sheetForm.diagnosesText, "diagnosis"),
          procedures: parseLines(sheetForm.proceduresText, "procedure"),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva foaia de spitalizare.");
      }

      toast.success("Foaia de spitalizare a fost creată și validată local.");
      setSheetForm({
        patientId: "",
        admissionId: "none",
        hospitalizationType: "continuous",
        admissionType: "elective",
        insuranceStatus: "insured",
        cnasPayerType: "cass",
        admissionDate: nowLocalDate(),
        dischargeDate: nowLocalDate(),
        admissionSection: "Neurologie",
        dischargeSection: "Neurologie",
        attendingPhysician: "",
        admissionDiagnosis: "",
        mainDiagnosis: "",
        dischargeStatus: "ameliorat",
        dischargeType: "la domiciliu",
        expectedReimbursement: "0",
        notes: "",
        diagnosesText: "",
        proceduresText: "",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la crearea foii de spitalizare.");
    } finally {
      setSavingSheet(false);
    }
  };

  const handleValidateSheet = async (sheetId: string) => {
    setValidatingSheetId(sheetId);
    try {
      const response = await fetch(`/api/admin/hospitalization-sheets/${sheetId}/validate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut valida foaia.");
      }
      toast.success("Foaia a fost revalidată.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la validarea foii.");
    } finally {
      setValidatingSheetId(null);
    }
  };

  const handleCreateBatch = async () => {
    setBatchCreating(true);
    try {
      const response = await fetch("/api/admin/cnas-reporting/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number(batchForm.month),
          year: Number(batchForm.year),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut crea batch-ul.");
      }
      toast.success("Batch-ul lunar a fost creat.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la crearea batch-ului.");
    } finally {
      setBatchCreating(false);
    }
  };

  const handleSubmitBatch = async (batchId: string) => {
    setSubmittingBatchId(batchId);
    try {
      const response = await fetch(`/api/admin/cnas-reporting/batches/${batchId}/submit`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut transmite batch-ul.");
      }
      toast.success("Simularea de transmitere a batch-ului a fost finalizată.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la transmiterea batch-ului.");
    } finally {
      setSubmittingBatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-200/80 bg-teal-50/60 dark:border-teal-900/50 dark:bg-teal-950/20">
        <CardContent className="p-5">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Flux digital pentru foaia de spitalizare și raportarea lunară
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Modulul separă internarea clinică de evidența administrativă cerută pentru raportare. Se creează foaia
            de spitalizare, se validează local setul minim de date și apoi foile valide sunt incluse într-un batch
            lunar pentru simularea raportării și a decontării.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="size-5" />
              <p className="text-sm font-medium">Foaie nouă</p>
            </div>
            <CardTitle>Înregistrare foaie de spitalizare</CardTitle>
            <CardDescription>
              Completează datele administrative minime necesare pentru evidență și decontare.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Select
              value={sheetForm.patientId}
              onValueChange={(value) =>
                setSheetForm((prev) => ({
                  ...prev,
                  patientId: value,
                  attendingPhysician:
                    prev.attendingPhysician || patients.find((patient) => patient.$id === value)?.primaryPhysician || "",
                }))
              }
            >
              <SelectTrigger><SelectValue placeholder="Selectează pacientul" /></SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.$id} value={patient.$id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sheetForm.admissionId}
              onValueChange={(value) => setSheetForm((prev) => ({ ...prev, admissionId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Internare legată (opțional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Fără internare existentă</SelectItem>
                {linkedPatientAdmissions.map((admission) => (
                  <SelectItem key={admission.$id} value={admission.$id}>
                    {admission.patientName} · {admission.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sheetForm.hospitalizationType}
              onValueChange={(value: HospitalizationSheetType) =>
                setSheetForm((prev) => ({ ...prev, hospitalizationType: value }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="continuous">Spitalizare continuă</SelectItem>
                <SelectItem value="day">Spitalizare de zi</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sheetForm.admissionType}
              onValueChange={(value) => setSheetForm((prev) => ({ ...prev, admissionType: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="elective">Programată</SelectItem>
                <SelectItem value="urgent">Urgentă</SelectItem>
                <SelectItem value="emergency">De urgență</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sheetForm.insuranceStatus}
              onValueChange={(value) => setSheetForm((prev) => ({ ...prev, insuranceStatus: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="insured">Asigurat</SelectItem>
                <SelectItem value="co-insured">Coasigurat</SelectItem>
                <SelectItem value="uninsured">Neasigurat</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sheetForm.cnasPayerType}
              onValueChange={(value) => setSheetForm((prev) => ({ ...prev, cnasPayerType: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cass">CASS</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
                <SelectItem value="mixed">Mixt</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={sheetForm.admissionDate}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, admissionDate: event.target.value }))}
            />

            <Input
              type="datetime-local"
              value={sheetForm.dischargeDate}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, dischargeDate: event.target.value }))}
            />

            <Input
              value={sheetForm.admissionSection}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, admissionSection: event.target.value }))}
              placeholder="Secția de internare"
            />

            <Input
              value={sheetForm.dischargeSection}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, dischargeSection: event.target.value }))}
              placeholder="Secția de externare"
            />

            <Input
              value={sheetForm.attendingPhysician}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, attendingPhysician: event.target.value }))}
              placeholder="Medic curant"
            />

            <Input
              type="number"
              min="0"
              step="0.01"
              value={sheetForm.expectedReimbursement}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, expectedReimbursement: event.target.value }))}
              placeholder="Suma estimată decontare"
            />

            <div className="md:col-span-2">
              <Input
                value={sheetForm.admissionDiagnosis}
                onChange={(event) => setSheetForm((prev) => ({ ...prev, admissionDiagnosis: event.target.value }))}
                placeholder="Diagnostic la internare"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                value={sheetForm.mainDiagnosis}
                onChange={(event) => setSheetForm((prev) => ({ ...prev, mainDiagnosis: event.target.value }))}
                placeholder="Diagnostic principal la externare"
              />
            </div>

            <Input
              value={sheetForm.dischargeStatus}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, dischargeStatus: event.target.value }))}
              placeholder="Stare la externare"
            />

            <Input
              value={sheetForm.dischargeType}
              onChange={(event) => setSheetForm((prev) => ({ ...prev, dischargeType: event.target.value }))}
              placeholder="Tip externare"
            />

            <div className="md:col-span-2">
              <Textarea
                rows={4}
                value={sheetForm.diagnosesText}
                onChange={(event) => setSheetForm((prev) => ({ ...prev, diagnosesText: event.target.value }))}
                placeholder={"Diagnostice secundare, câte unul pe rând.\nFormat: COD | Denumire | da(optional pentru prezent la internare)"}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                rows={4}
                value={sheetForm.proceduresText}
                onChange={(event) => setSheetForm((prev) => ({ ...prev, proceduresText: event.target.value }))}
                placeholder={"Proceduri / intervenții, câte una pe rând.\nFormat: COD | Denumire | Performer"}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                rows={3}
                value={sheetForm.notes}
                onChange={(event) => setSheetForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Observații administrative privind episodul raportabil."
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 md:col-span-2">
              {selectedPatient && (
                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  Asigurător: {selectedPatient.insuranceProvider || "Nespecificat"}
                </span>
              )}
              {linkedAdmission && (
                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  Internare legată: {linkedAdmission.department}
                </span>
              )}
            </div>

            <div className="md:col-span-2">
              <Button type="button" onClick={handleCreateSheet} disabled={savingSheet}>
                {savingSheet ? "Se salvează..." : "Creează foaia"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <ClipboardCheck className="size-5" />
              <p className="text-sm font-medium">Batch lunar</p>
            </div>
            <CardTitle>Pregătire raportare CNAS</CardTitle>
            <CardDescription>
              Batch-ul include doar foile validate local și le simulează ca transmise în lot lunar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                value={batchForm.month}
                onValueChange={(value) => setBatchForm((prev) => ({ ...prev, month: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Luna {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={batchForm.year}
                onChange={(event) => setBatchForm((prev) => ({ ...prev, year: event.target.value }))}
                placeholder="An"
              />
            </div>

            <Button type="button" variant="outline" onClick={handleCreateBatch} disabled={batchCreating}>
              {batchCreating ? "Se generează..." : "Generează batch"}
            </Button>

            <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              La trimiterea batch-ului, cazurile acceptate generează automat și tranzacții de venit în modulul financiar.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Foi de spitalizare</CardTitle>
          <CardDescription>
            Evidența foilor create, cu starea de validare și de raportare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sheets.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu există încă foi de spitalizare introduse în sistem.
            </p>
          ) : (
            sheets.map((sheet) => (
              <div key={sheet.$id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Foaia {sheet.sheetNumber}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {sheet.patient?.name} · {sheet.attendingPhysician} · {sheet.hospitalizationType === "continuous" ? "spitalizare continuă" : "spitalizare de zi"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {sheetValidationLabel(sheet.validationStatus)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {reportStatusLabel(sheet.reportStatus)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-400 lg:grid-cols-2">
                  <p>Internare: <span className="font-medium text-slate-800 dark:text-slate-200">{formatDateTime(sheet.admissionDate).dateTime}</span></p>
                  <p>Externare: <span className="font-medium text-slate-800 dark:text-slate-200">{formatDateTime(sheet.dischargeDate).dateTime}</span></p>
                  <p>Secție: <span className="font-medium text-slate-800 dark:text-slate-200">{sheet.admissionSection} → {sheet.dischargeSection}</span></p>
                  <p>Zile spitalizare: <span className="font-medium text-slate-800 dark:text-slate-200">{sheet.totalDays}</span></p>
                  <p>Diagnostic principal: <span className="font-medium text-slate-800 dark:text-slate-200">{sheet.mainDiagnosis}</span></p>
                  <p>Decontare estimată: <span className="font-medium text-slate-800 dark:text-slate-200">{sheet.expectedReimbursement.toLocaleString("ro-RO")} lei</span></p>
                </div>

                {sheet.validationErrors.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Erori de validare</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800 dark:text-amber-300">
                      {sheet.validationErrors.map((error, index) => (
                        <li key={`${sheet.$id}-error-${index}`}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(sheet.diagnoses.length > 0 || sheet.procedures.length > 0) && (
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Diagnostice asociate</p>
                      <div className="mt-2 space-y-2">
                        {sheet.diagnoses.map((diagnosis) => (
                          <div key={diagnosis.$id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{diagnosis.diagnosisName}</span>
                            <span className="ml-2 text-slate-500 dark:text-slate-400">{diagnosis.diagnosisCode || "fără cod"} · {diagnosis.diagnosisKind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Proceduri asociate</p>
                      <div className="mt-2 space-y-2">
                        {sheet.procedures.map((procedure) => (
                          <div key={procedure.$id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{procedure.procedureName}</span>
                            <span className="ml-2 text-slate-500 dark:text-slate-400">{procedure.procedureCode || "fără cod"} · {procedure.performer || "performer nespecificat"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleValidateSheet(sheet.$id)}
                    disabled={validatingSheetId === sheet.$id}
                  >
                    <ShieldCheck className="mr-2 size-4" />
                    {validatingSheetId === sheet.$id ? "Se validează..." : "Revalidează foaia"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Batch-uri de raportare</CardTitle>
          <CardDescription>
            Loturile lunare generate pentru simularea transmiterii către CNAS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {batches.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu există încă batch-uri de raportare generate.
            </p>
          ) : (
            batches.map(({ batch, items }) => (
              <div key={batch.$id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Batch {batch.batchMonth}/{batch.batchYear}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {batch.totalSheets} foi · {batch.acceptedSheets} acceptate · {batch.rejectedSheets} respinse
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {batchStatusLabel(batch.status)}
                    </span>
                    {batch.status === "validated" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSubmitBatch(batch.$id)}
                        disabled={submittingBatchId === batch.$id}
                      >
                        <Send className="mr-2 size-4" />
                        {submittingBatchId === batch.$id ? "Se trimite..." : "Simulează trimiterea"}
                      </Button>
                    )}
                  </div>
                </div>

                {batch.responseSummary && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{batch.responseSummary}</p>
                )}

                <div className="mt-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.$id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {item.sheet?.sheetNumber} · {item.sheet?.patient?.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{reportStatusLabel(item.itemStatus)}</span>
                      </div>
                      {item.responseMessage && (
                        <p className="mt-1 text-slate-600 dark:text-slate-400">{item.responseMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
