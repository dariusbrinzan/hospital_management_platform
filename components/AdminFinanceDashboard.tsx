"use client";

import { BanknoteArrowDown, BanknoteArrowUp, CarFront, Landmark, Wallet } from "lucide-react";
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

interface AdminFinanceDashboardProps {
  summary: {
    windowDays: number;
    revenue: number;
    expense: number;
    deduction: number;
    reimbursement: number;
    pendingCount: number;
    balance: number;
    byCategory: Array<{ category: string; transactionType: string; total: number }>;
  };
  transactions: FinancialTransaction[];
  fuelLogs: AmbulanceFuelLog[];
  ambulances: Ambulance[];
}

const FINANCIAL_CATEGORIES: Array<{ value: FinancialCategory; label: string }> = [
  { value: "surgery", label: "Bloc operator / chirurgie" },
  { value: "hospitalization", label: "Spitalizare" },
  { value: "imaging", label: "Imagistică" },
  { value: "laboratory", label: "Laborator" },
  { value: "pharmacy", label: "Farmacie" },
  { value: "medication_procurement", label: "Achiziție medicamente" },
  { value: "ambulance_fuel", label: "Combustibil ambulanțe" },
  { value: "ambulance_maintenance", label: "Mentenanță ambulanțe" },
  { value: "consumables", label: "Consumabile" },
  { value: "equipment_maintenance", label: "Mentenanță echipamente" },
  { value: "utilities", label: "Utilități" },
  { value: "salary", label: "Salarii" },
  { value: "insurance", label: "Asigurări" },
  { value: "it_infrastructure", label: "Infrastructură IT" },
  { value: "other", label: "Altă categorie" },
];

const COST_CENTERS: Array<{ value: FinancialCostCenter; label: string }> = [
  { value: "operating_room", label: "Bloc operator" },
  { value: "ambulance", label: "Ambulanțe" },
  { value: "emergency", label: "UPU" },
  { value: "hospitalization", label: "Spitalizare" },
  { value: "icu", label: "ATI" },
  { value: "laboratory", label: "Laborator" },
  { value: "imaging", label: "Imagistică" },
  { value: "pharmacy", label: "Farmacie" },
  { value: "administration", label: "Administrativ" },
  { value: "general", label: "General" },
];

const statusLabel = (status: FinancialRecordStatus) => {
  switch (status) {
    case "approved":
      return "Aprobat";
    case "paid":
      return "Plătit";
    case "cancelled":
      return "Anulat";
    case "reimbursed":
      return "Rambursat";
    default:
      return "În așteptare";
  }
};

const typeLabel = (type: FinancialTransactionType) => {
  switch (type) {
    case "expense":
      return "Cheltuială";
    case "deduction":
      return "Deducere";
    case "reimbursement":
      return "Rambursare";
    default:
      return "Venit";
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 2,
  }).format(value || 0);

const toLocalInput = (value?: Date | string) => {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

export function AdminFinanceDashboard({
  summary,
  transactions,
  fuelLogs,
  ambulances,
}: AdminFinanceDashboardProps) {
  const router = useRouter();
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [savingFuel, setSavingFuel] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    transactionType: "expense" as FinancialTransactionType,
    category: "utilities" as FinancialCategory,
    costCenter: "general" as FinancialCostCenter,
    amount: "",
    taxAmount: "0",
    deductibleAmount: "0",
    status: "pending" as FinancialRecordStatus,
    description: "",
    occurredAt: toLocalInput(),
    createdBy: "Administrator financiar",
    notes: "",
  });
  const [fuelForm, setFuelForm] = useState({
    ambulanceId: ambulances[0]?.$id || "",
    liters: "",
    costPerLiter: "7.45",
    odometerKm: "",
    stationName: "",
    fueledBy: "Coordonator parc auto",
    fueledAt: toLocalInput(),
    notes: "",
  });

  const topCategories = useMemo(() => summary.byCategory.slice(0, 6), [summary.byCategory]);

  const handleTransactionSubmit = async () => {
    if (!transactionForm.description.trim() || !transactionForm.amount) {
      toast.error("Completează descrierea și suma operațiunii financiare.");
      return;
    }

    setSavingTransaction(true);
    try {
      const response = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionType: transactionForm.transactionType,
          category: transactionForm.category,
          costCenter: transactionForm.costCenter,
          amount: Number(transactionForm.amount),
          taxAmount: Number(transactionForm.taxAmount),
          deductibleAmount: Number(transactionForm.deductibleAmount),
          status: transactionForm.status,
          description: transactionForm.description,
          occurredAt: new Date(transactionForm.occurredAt).toISOString(),
          createdBy: transactionForm.createdBy,
          notes: transactionForm.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva operațiunea financiară.");
      }

      toast.success("Operațiunea financiară a fost înregistrată.");
      setTransactionForm((prev) => ({
        ...prev,
        amount: "",
        description: "",
        notes: "",
        occurredAt: toLocalInput(),
      }));
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la salvarea operațiunii financiare.");
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleFuelSubmit = async () => {
    if (!fuelForm.ambulanceId || !fuelForm.liters || !fuelForm.costPerLiter) {
      toast.error("Completează ambulanța, litrii și costul pe litru.");
      return;
    }

    setSavingFuel(true);
    try {
      const response = await fetch("/api/admin/finance/ambulance-fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: fuelForm.ambulanceId,
          liters: Number(fuelForm.liters),
          costPerLiter: Number(fuelForm.costPerLiter),
          odometerKm: fuelForm.odometerKm ? Number(fuelForm.odometerKm) : null,
          stationName: fuelForm.stationName,
          fueledBy: fuelForm.fueledBy,
          fueledAt: new Date(fuelForm.fueledAt).toISOString(),
          notes: fuelForm.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva alimentarea.");
      }

      toast.success("Alimentarea ambulanței a fost înregistrată și trecută automat în registrul financiar.");
      setFuelForm((prev) => ({
        ...prev,
        liters: "",
        odometerKm: "",
        stationName: "",
        notes: "",
        fueledAt: toLocalInput(),
      }));
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la salvarea alimentării.");
    } finally {
      setSavingFuel(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-200/80 bg-teal-50/60 dark:border-teal-900/50 dark:bg-teal-950/20">
        <CardContent className="p-5">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Flux financiar centralizat
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Modulul centralizează veniturile și cheltuielile din chirurgie, imagistică, laborator, spitalizare,
            farmacie, mentenanță, utilități și transport medical. Alimentările de ambulanță intră automat ca
            cheltuieli, iar cazurile operatorii sincronizează automat componentele de CASS și contribuția pacientului.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <BanknoteArrowUp className="size-4" />
              <p className="text-sm font-medium">Venituri</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(summary.revenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <BanknoteArrowDown className="size-4" />
              <p className="text-sm font-medium">Cheltuieli</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(summary.expense)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Wallet className="size-4" />
              <p className="text-sm font-medium">Deduceri</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(summary.deduction)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Landmark className="size-4" />
              <p className="text-sm font-medium">Rambursări</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(summary.reimbursement)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sold {summary.windowDays} zile</p>
            <p className={`mt-2 text-2xl font-semibold ${summary.balance >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary.pendingCount} în așteptare
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Înregistrează operațiune financiară</CardTitle>
            <CardDescription>
              Poți introduce venituri, cheltuieli, deduceri sau rambursări pentru orice centru de cost din spital.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Select
              value={transactionForm.transactionType}
              onValueChange={(value: FinancialTransactionType) => setTransactionForm((prev) => ({ ...prev, transactionType: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Venit</SelectItem>
                <SelectItem value="expense">Cheltuială</SelectItem>
                <SelectItem value="deduction">Deducere</SelectItem>
                <SelectItem value="reimbursement">Rambursare</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={transactionForm.status}
              onValueChange={(value: FinancialRecordStatus) => setTransactionForm((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">În așteptare</SelectItem>
                <SelectItem value="approved">Aprobat</SelectItem>
                <SelectItem value="paid">Plătit</SelectItem>
                <SelectItem value="cancelled">Anulat</SelectItem>
                <SelectItem value="reimbursed">Rambursat</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={transactionForm.category}
              onValueChange={(value: FinancialCategory) => setTransactionForm((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FINANCIAL_CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={transactionForm.costCenter}
              onValueChange={(value: FinancialCostCenter) => setTransactionForm((prev) => ({ ...prev, costCenter: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COST_CENTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={transactionForm.amount}
              onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="Valoare"
            />
            <Input
              type="datetime-local"
              value={transactionForm.occurredAt}
              onChange={(event) => setTransactionForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={transactionForm.taxAmount}
              onChange={(event) => setTransactionForm((prev) => ({ ...prev, taxAmount: event.target.value }))}
              placeholder="Taxe / TVA"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={transactionForm.deductibleAmount}
              onChange={(event) => setTransactionForm((prev) => ({ ...prev, deductibleAmount: event.target.value }))}
              placeholder="Deducere"
            />
            <Input
              value={transactionForm.createdBy}
              onChange={(event) => setTransactionForm((prev) => ({ ...prev, createdBy: event.target.value }))}
              placeholder="Inițiat de"
            />
            <div className="md:col-span-2">
              <Input
                value={transactionForm.description}
                onChange={(event) => setTransactionForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Descriere operațiune"
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                rows={3}
                value={transactionForm.notes}
                onChange={(event) => setTransactionForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Detalii suplimentare: furnizor, centru de cost, observații de audit."
              />
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={handleTransactionSubmit} disabled={savingTransaction}>
                {savingTransaction ? "Se salvează..." : "Salvează operațiunea"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <CarFront className="size-5" />
              <p className="text-sm font-medium">Combustibil ambulanțe</p>
            </div>
            <CardTitle>Alimentare parc auto</CardTitle>
            <CardDescription>
              Fiecare alimentare generează automat o cheltuială financiară pe centrul de cost „Ambulanțe”.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Select
              value={fuelForm.ambulanceId}
              onValueChange={(value) => setFuelForm((prev) => ({ ...prev, ambulanceId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Selectează ambulanța" /></SelectTrigger>
              <SelectContent>
                {ambulances.map((ambulance) => (
                  <SelectItem key={ambulance.$id} value={ambulance.$id}>
                    {ambulance.ambulanceNumber} · {ambulance.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="datetime-local"
              value={fuelForm.fueledAt}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, fueledAt: event.target.value }))}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={fuelForm.liters}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, liters: event.target.value }))}
              placeholder="Litri alimentați"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={fuelForm.costPerLiter}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, costPerLiter: event.target.value }))}
              placeholder="Cost / litru"
            />
            <Input
              type="number"
              min="0"
              value={fuelForm.odometerKm}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, odometerKm: event.target.value }))}
              placeholder="Kilometraj"
            />
            <Input
              value={fuelForm.stationName}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, stationName: event.target.value }))}
              placeholder="Stație alimentare"
            />
            <Input
              value={fuelForm.fueledBy}
              onChange={(event) => setFuelForm((prev) => ({ ...prev, fueledBy: event.target.value }))}
              placeholder="Responsabil alimentare"
            />
            <div className="md:col-span-2">
              <Textarea
                rows={3}
                value={fuelForm.notes}
                onChange={(event) => setFuelForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Observații: schimb de tură, cursă specială, alimentare de prevenție."
              />
            </div>
            <div className="md:col-span-2">
              <Button type="button" variant="outline" onClick={handleFuelSubmit} disabled={savingFuel}>
                {savingFuel ? "Se salvează..." : "Salvează alimentarea"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Top categorii în perioada curentă</CardTitle>
            <CardDescription>
              Primele categorii după volum financiar în ultimele {summary.windowDays} zile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Nu există suficiente date pentru agregare.</p>
            ) : (
              topCategories.map((entry, index) => (
                <div key={`${entry.category}-${entry.transactionType}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.category}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{typeLabel(entry.transactionType as FinancialTransactionType)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(entry.total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Alimentări recente ambulanțe</CardTitle>
            <CardDescription>Ultimele alimentări înregistrate în parc și impactul lor în costuri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fuelLogs.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Nu există alimentări înregistrate.</p>
            ) : (
              fuelLogs.map((log) => (
                <div key={log.$id} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {log.ambulance?.ambulanceNumber || "Ambulanță"} · {formatCurrency(log.totalCost)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {log.liters} L × {formatCurrency(log.costPerLiter)} · {log.stationName || "Stație nespecificată"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(log.fueledAt).dateTime}</p>
                  </div>
                  {(log.fueledBy || log.odometerKm || log.notes) && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {[log.fueledBy, log.odometerKm ? `${log.odometerKm} km` : null, log.notes].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Registru financiar recent</CardTitle>
          <CardDescription>
            Tranzacțiile recente, indiferent dacă sunt introduse manual, generate din chirurgie sau din alimentarea ambulanțelor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Registrul financiar este momentan gol.</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.$id} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {typeLabel(transaction.transactionType)} · {transaction.category} · {transaction.costCenter}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-semibold ${transaction.transactionType === "revenue" || transaction.transactionType === "reimbursement" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(transaction.occurredAt).dateTime}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{statusLabel(transaction.status)}</span>
                  {transaction.createdBy && <span>Inițiat de: {transaction.createdBy}</span>}
                  {transaction.patient?.name && <span>Pacient: {transaction.patient.name}</span>}
                  {transaction.sourceType && <span>Sursă: {transaction.sourceType}</span>}
                  {transaction.deductibleAmount > 0 && <span>Deducere: {formatCurrency(transaction.deductibleAmount)}</span>}
                </div>
                {transaction.notes && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{transaction.notes}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
