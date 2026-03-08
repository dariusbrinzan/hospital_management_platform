"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MedicationStockCard } from "./MedicationStockCard";
import { RestockModal } from "./RestockModal";
import { BatchesModal } from "./BatchesModal";
import { Package, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

type MedicationStockWithPartialMed = Omit<MedicationStock, "medication"> & { medication?: Partial<Medication> | null };

interface MedicationStockDashboardProps {
  allStocks: MedicationStockWithPartialMed[];
  lowStock: MedicationStockWithPartialMed[];
  emergencyStocks: MedicationStockWithPartialMed[];
  icuStocks: MedicationStockWithPartialMed[];
}

export const MedicationStockDashboard = ({
  allStocks,
  lowStock,
  emergencyStocks,
  icuStocks,
}: MedicationStockDashboardProps) => {
  const [selectedView, setSelectedView] = useState<"all" | "emergency" | "icu" | "low">("all");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MedicationStockWithPartialMed | null>(null);
  const [stockForBatches, setStockForBatches] = useState<MedicationStockWithPartialMed | null>(null);

  const getStocksForView = () => {
    switch (selectedView) {
      case "emergency":
        return emergencyStocks;
      case "icu":
        return icuStocks;
      case "low":
        return lowStock;
      default:
        return allStocks;
    }
  };

  const totalItems = allStocks.length;
  const lowStockCount = lowStock.length;
  const totalQuantity = allStocks.reduce((sum, s) => sum + s.quantity, 0);
  const totalAvailable = allStocks.reduce((sum, s) => sum + (s.availableQuantity ?? 0), 0);

  const tabs = [
    { id: "all" as const, label: "Toate", count: allStocks.length },
    { id: "emergency" as const, label: "Urgențe", count: emergencyStocks.length },
    { id: "icu" as const, label: "ATI", count: icuStocks.length },
    { id: "low" as const, label: "Stoc scăzut", count: lowStockCount },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalItems}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total medicamente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalQuantity}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cantitate totală</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalAvailable}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Disponibil</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{lowStockCount}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stoc scăzut</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Stocuri pe locație și filtre
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selectați vizualizarea pentru a vedea toate stocurile, doar urgențe/ATI sau doar stocuri sub minim.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedView(tab.id)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedView === tab.id
                    ? "border-b-2 border-teal-600 bg-teal-50/50 text-teal-700 dark:border-teal-500 dark:bg-teal-900/20 dark:text-teal-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getStocksForView().map((stock) => (
              <MedicationStockCard
                key={stock.$id}
                stock={stock}
                onRestock={() => {
                  setSelectedStock(stock);
                  setShowRestockModal(true);
                }}
                onBatches={() => setStockForBatches(stock)}
              />
            ))}
          </div>

          {getStocksForView().length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nu există stocuri pentru această secțiune.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showRestockModal && selectedStock && (
        <RestockModal
          stock={selectedStock}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedStock(null);
          }}
          onSuccess={() => {
            setShowRestockModal(false);
            setSelectedStock(null);
            window.location.reload();
          }}
        />
      )}

      {stockForBatches && (
        <BatchesModal
          stockId={stockForBatches.$id}
          medicationName={stockForBatches.medication?.name ?? "Medicament"}
          onClose={() => setStockForBatches(null)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};
