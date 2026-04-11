"use client";

import { Pill, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { MedicationAdministrationTimeline } from "@/components/MedicationAdministrationTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AvailableEmergencyStock = {
  $id: string;
  medicationId: string;
  availableQuantity: number;
  location: string;
  medication: {
    $id: string;
    name: string;
    strength?: string | null;
    unit: string;
  };
};

interface EmergencyMedicationAdministrationSectionProps {
  caseId: string;
  patientId?: string | null;
  performedBy: string;
  initialEntries: PatientMedicationAdministration[];
}

const nowLocalInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export function EmergencyMedicationAdministrationSection({
  caseId,
  patientId,
  performedBy,
  initialEntries,
}: EmergencyMedicationAdministrationSectionProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [stocks, setStocks] = useState<AvailableEmergencyStock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    stockId: "",
    dosage: "",
    quantity: "1",
    route: "iv",
    administrationPhase: "before_doctor" as MedicationAdministrationPhase,
    administeredBy: performedBy,
    administeredAt: nowLocalInput(),
    notes: "",
  });

  const loadStocks = async () => {
    setLoadingStocks(true);
    try {
      const response = await fetch("/api/medications/stock?location=emergency_department&available=true");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu s-a putut încărca stocul de urgență.");
      }
      setStocks(data);
    } catch (error: any) {
      toast.error(error?.message || "Eroare la încărcarea stocurilor disponibile.");
    } finally {
      setLoadingStocks(false);
    }
  };

  const handleOpenForm = async () => {
    setShowForm((prev) => !prev);
    if (stocks.length === 0) {
      await loadStocks();
    }
  };

  const selectedStock = stocks.find((stock) => stock.$id === form.stockId);

  const handleStockChange = (stockId: string) => {
    const nextStock = stocks.find((stock) => stock.$id === stockId);
    setForm((prev) => ({
      ...prev,
      stockId,
      dosage: nextStock?.medication.strength || prev.dosage,
    }));
  };

  const handleSubmit = async () => {
    if (!patientId) {
      toast.error("Cazul de urgență nu este legat de un pacient din sistem.");
      return;
    }

    if (!form.stockId) {
      toast.error("Selectează un medicament din stoc.");
      return;
    }

    if (!form.dosage.trim()) {
      toast.error("Completează doza administrată.");
      return;
    }

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Cantitatea trebuie să fie mai mare decât 0.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/emergency/${caseId}/medication-administrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: form.stockId,
          dosage: form.dosage,
          quantity,
          route: form.route,
          administrationPhase: form.administrationPhase,
          administeredBy: form.administeredBy,
          administeredAt: new Date(form.administeredAt).toISOString(),
          notes: form.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu s-a putut salva administrarea.");
      }

      setEntries((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(a.administeredAt).getTime() - new Date(b.administeredAt).getTime()
        )
      );
      setForm({
        stockId: "",
        dosage: "",
        quantity: "1",
        route: "iv",
        administrationPhase: "before_doctor",
        administeredBy: performedBy,
        administeredAt: nowLocalInput(),
        notes: "",
      });
      setShowForm(false);
      toast.success("Administrarea a fost salvată și stocul a fost actualizat.");
      await loadStocks();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la salvarea administrării.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Pill className="size-4" />
            Medicație administrată în UPU
          </h3>
        </div>

        <Button type="button" onClick={handleOpenForm} className="rounded-lg bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 size-4" />
          {showForm ? "Ascunde formularul" : "Adaugă administrare"}
        </Button>
      </div>

      <div className="space-y-6 px-6 py-5">
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medicament din stoc</label>
                <Select value={form.stockId} onValueChange={handleStockChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingStocks ? "Se încarcă..." : "Selectează medicament"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stocks.map((stock) => (
                      <SelectItem key={stock.$id} value={stock.$id}>
                        {stock.medication.name}
                        {stock.medication.strength ? ` (${stock.medication.strength})` : ""}
                        {` - ${stock.availableQuantity} ${stock.medication.unit}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStock && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Disponibil: {selectedStock.availableQuantity} {selectedStock.medication.unit} din stocul UPU
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fază administrare</label>
                <Select
                  value={form.administrationPhase}
                  onValueChange={(value: MedicationAdministrationPhase) =>
                    setForm((prev) => ({ ...prev, administrationPhase: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_doctor">Înainte de medic</SelectItem>
                    <SelectItem value="doctor_care">În grija medicului</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doză</label>
                <Input
                  value={form.dosage}
                  onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))}
                  placeholder="ex: 30mg/ml"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cantitate</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cale administrare</label>
                <Input
                  value={form.route}
                  onChange={(event) => setForm((prev) => ({ ...prev, route: event.target.value }))}
                  placeholder="IV / oral / IM"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Administrat de</label>
                <Input
                  value={form.administeredBy}
                  onChange={(event) => setForm((prev) => ({ ...prev, administeredBy: event.target.value }))}
                  placeholder="Numele cadrului medical"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Moment administrare</label>
                <Input
                  type="datetime-local"
                  value={form.administeredAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, administeredAt: event.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observații</label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Ex: administrat pentru calmarea cefaleei și reducerea durerii."
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? "Se salvează..." : "Salvează administrarea"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Renunță
              </Button>
            </div>
          </div>
        )}

        <MedicationAdministrationTimeline
          entries={entries}
          emptyMessage="Nu există încă medicație administrată pentru acest caz de urgență."
          chronological
        />
      </div>
    </div>
  );
}
