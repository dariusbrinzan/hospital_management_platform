"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { MedicationStockCard } from "./MedicationStockCard";
import { RestockModal } from "./RestockModal";
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

  const locationLabels: Record<string, string> = {
    main_pharmacy: "Farmacie Principală",
    emergency_department: "Serviciu Urgențe",
    icu_ward: "Secție ATI",
    surgery_ward: "Secție Chirurgie",
  };

  const totalItems = allStocks.length;
  const lowStockCount = lowStock.length;
  const totalQuantity = allStocks.reduce((sum, s) => sum + s.quantity, 0);
  const totalAvailable = allStocks.reduce((sum, s) => sum + (s.availableQuantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header cu statistici */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="header">Dashboard Stocuri Medicamente</h2>
            <p className="text-dark-600">
              Gestionați stocurile de medicamente și tratamente
            </p>
          </div>
        </div>

        {/* Statistici rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-12-regular text-blue-700 mb-1">Total Medicamente</p>
            <p className="text-24-bold text-blue-900">{totalItems}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-12-regular text-green-700 mb-1">Cantitate Totală</p>
            <p className="text-24-bold text-green-900">{totalQuantity}</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-12-regular text-purple-700 mb-1">Disponibil</p>
            <p className="text-24-bold text-purple-900">{totalAvailable}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-12-regular text-red-700 mb-1">Stoc Scăzut</p>
            <p className="text-24-bold text-red-900">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs pentru view */}
      <div className="flex gap-2 border-b border-dark-200">
        <button
          onClick={() => setSelectedView("all")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "all"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          Toate ({allStocks.length})
        </button>
        <button
          onClick={() => setSelectedView("emergency")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "emergency"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          Urgențe ({emergencyStocks.length})
        </button>
        <button
          onClick={() => setSelectedView("icu")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "icu"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          ATI ({icuStocks.length})
        </button>
        <button
          onClick={() => setSelectedView("low")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "low"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          Stoc Scăzut ({lowStockCount})
        </button>
      </div>

      {/* Lista stocuri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getStocksForView().map((stock) => (
          <MedicationStockCard
            key={stock.$id}
            stock={stock}
            onRestock={() => {
              setSelectedStock(stock);
              setShowRestockModal(true);
            }}
          />
        ))}
      </div>

      {getStocksForView().length === 0 && (
        <div className="rounded-lg border border-dark-200 bg-white p-8 text-center">
          <p className="text-16-regular text-dark-600">
            Nu există stocuri pentru această secțiune
          </p>
        </div>
      )}

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
    </div>
  );
};
