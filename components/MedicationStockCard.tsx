"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { formatDateTime } from "@/lib/utils";
import { MapPin, Package, ShoppingCart } from "lucide-react";

type MedicationStockWithPartialMed = Omit<MedicationStock, "medication"> & { medication?: Partial<Medication> | null };

interface MedicationStockCardProps {
  stock: MedicationStockWithPartialMed;
  onRestock: () => void;
  onBatches?: () => void;
}

const locationLabels: Record<string, string> = {
  main_pharmacy: "Farmacie Principală",
  emergency_department: "Serviciu Urgențe",
  icu_ward: "Secție ATI",
  surgery_ward: "Secție Chirurgie",
};

export const MedicationStockCard = ({ stock, onRestock, onBatches }: MedicationStockCardProps) => {
  const [reorderLoading, setReorderLoading] = useState(false);
  const isLowStock = (stock.availableQuantity ?? 0) <= stock.minimumStockLevel;
  const reorderQty = stock.reorderQuantity ?? stock.minimumStockLevel ?? 10;

  const handleReorder = async () => {
    setReorderLoading(true);
    try {
      const res = await fetch("/api/admin/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedBy: "Admin",
          lines: [{ medicationId: stock.medicationId, quantity: reorderQty }],
        }),
      });
      const data = await res.json();
      if (data.$id) {
        window.location.href = "/admin/pharmacy";
      } else {
        alert(data.error || "Eroare la creare comandă");
      }
    } catch {
      alert("Eroare la creare comandă");
    } finally {
      setReorderLoading(false);
    }
  };
  const stockPercentage =
    stock.maximumStockLevel > 0 ? (stock.quantity / stock.maximumStockLevel) * 100 : 0;

  return (
    <Card
      className={`overflow-hidden border-2 shadow-sm transition dark:border-slate-800 ${
        isLowStock
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
          : stockPercentage > 80
            ? "border-emerald-200/80 bg-white dark:border-emerald-800/50 dark:bg-slate-900"
            : "border-slate-200/80 bg-white dark:bg-slate-900"
      }`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {stock.medication?.name || "Medicament necunoscut"}
            </h3>
            {stock.medication?.genericName && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{stock.medication.genericName}</p>
            )}
            {stock.medication?.strength && (
              <p className="text-xs text-slate-500 dark:text-slate-500">{stock.medication.strength}</p>
            )}
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="size-3.5" />
              {locationLabels[stock.location] || stock.location}
            </p>
          </div>
          {isLowStock && (
            <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              Stoc scăzut
            </span>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Cantitate totală</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {stock.quantity} {stock.medication?.unit || ""}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Rezervată</span>
            <span className="text-slate-700 dark:text-slate-300">
              {stock.reservedQuantity ?? 0} {stock.medication?.unit || ""}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Disponibilă</span>
            <span
              className={`font-semibold ${isLowStock ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}
            >
              {stock.availableQuantity ?? 0} {stock.medication?.unit || ""}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Min: {stock.minimumStockLevel}</span>
            <span>Max: {stock.maximumStockLevel}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full ${
                isLowStock
                  ? "bg-amber-500"
                  : stockPercentage > 80
                    ? "bg-emerald-500"
                    : "bg-teal-500"
              }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
        </div>

        {stock.lastRestockedDate && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ultima reaprovizionare: {formatDateTime(stock.lastRestockedDate).dateOnly}
            {stock.lastRestockedQuantity != null && (
              <> · +{stock.lastRestockedQuantity} {stock.medication?.unit || ""}</>
            )}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
        <Button
          onClick={onRestock}
          className="flex-1 rounded-lg bg-teal-600 hover:bg-teal-700"
          size="sm"
        >
          Reaprovizionează
        </Button>
        {onBatches && (
          <Button variant="outline" size="sm" onClick={onBatches} className="rounded-lg">
            <Package className="mr-1 size-4" />
            Loturi
          </Button>
        )}
        {isLowStock && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReorder}
            disabled={reorderLoading}
            className="rounded-lg border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
          >
            <ShoppingCart className="mr-1 size-4" />
            {reorderLoading ? "..." : "Comandă reaprovizionare"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
