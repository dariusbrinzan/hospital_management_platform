"use client";

import { MedicationStock } from "@/types";
import { Button } from "./ui/button";
import { formatDateTime } from "@/lib/utils";

interface MedicationStockCardProps {
  stock: MedicationStock;
  onRestock: () => void;
}

const locationLabels: Record<string, string> = {
  main_pharmacy: "Farmacie Principală",
  emergency_department: "Serviciu Urgențe",
  icu_ward: "Secție ATI",
  surgery_ward: "Secție Chirurgie",
};

export const MedicationStockCard = ({ stock, onRestock }: MedicationStockCardProps) => {
  const isLowStock = (stock.availableQuantity || 0) <= stock.minimumStockLevel;
  const stockPercentage = stock.maximumStockLevel > 0
    ? ((stock.quantity / stock.maximumStockLevel) * 100)
    : 0;

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${
      isLowStock
        ? "border-red-200 bg-red-50"
        : stockPercentage > 80
        ? "border-green-200 bg-green-50"
        : "border-dark-200 bg-white"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-18-semibold text-dark-900 mb-1">
            {stock.medication?.name || "Medicament necunoscut"}
          </h3>
          {stock.medication?.genericName && (
            <p className="text-14-regular text-dark-600 mb-1">
              {stock.medication.genericName}
            </p>
          )}
          {stock.medication?.strength && (
            <p className="text-12-regular text-dark-500 mb-2">
              {stock.medication.strength}
            </p>
          )}
          <p className="text-12-regular text-dark-500">
            📍 {locationLabels[stock.location] || stock.location}
          </p>
        </div>
        {isLowStock && (
          <span className="px-3 py-1 rounded-full text-12-semibold text-red-700 bg-red-100 border border-red-200">
            Stoc Scăzut
          </span>
        )}
      </div>

      {/* Informații stoc */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-14-semibold text-dark-700">Cantitate Totală:</span>
          <span className="text-16-bold text-dark-900">{stock.quantity} {stock.medication?.unit || ""}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-14-semibold text-dark-700">Rezervată:</span>
          <span className="text-14-regular text-dark-600">{stock.reservedQuantity} {stock.medication?.unit || ""}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-14-semibold text-dark-700">Disponibilă:</span>
          <span className={`text-16-bold ${
            isLowStock ? "text-red-700" : "text-green-700"
          }`}>
            {stock.availableQuantity || 0} {stock.medication?.unit || ""}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-12-regular text-dark-500 mb-1">
            <span>Min: {stock.minimumStockLevel}</span>
            <span>Max: {stock.maximumStockLevel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isLowStock
                  ? "bg-red-500"
                  : stockPercentage > 80
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ultima reaprovizionare */}
      {stock.lastRestockedDate && (
        <div className="mb-4 text-12-regular text-dark-500">
          <p>Ultima reaprovizionare: {formatDateTime(stock.lastRestockedDate).date}</p>
          {stock.lastRestockedQuantity && (
            <p>Cantitate: +{stock.lastRestockedQuantity} {stock.medication?.unit || ""}</p>
          )}
        </div>
      )}

      {/* Acțiuni */}
      <Button
        onClick={onRestock}
        className="w-full shad-primary-btn"
        size="sm"
      >
        Reaprovizionează
      </Button>
    </div>
  );
};
