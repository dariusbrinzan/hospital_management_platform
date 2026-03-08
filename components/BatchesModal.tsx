"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Package } from "lucide-react";

type Batch = { $id: string; batchNumber: string; expirationDate: string; quantity: number; receivedAt: string };

interface BatchesModalProps {
  stockId: string;
  medicationName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchesModal({ stockId, medicationName, onClose, onSuccess }: BatchesModalProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetch(`/api/admin/pharmacy/stock/${stockId}/batches`)
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .then(setBatches)
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, [stockId]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim() || !expirationDate || !quantity || Number(quantity) < 1) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pharmacy/stock/${stockId}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchNumber: batchNumber.trim(),
          expirationDate,
          quantity: Number(quantity),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Eroare la adăugare lot");
        return;
      }
      const newBatch = await res.json();
      setBatches((prev) => [...prev, { ...newBatch, $id: newBatch.$id, receivedAt: new Date().toISOString() }]);
      setBatchNumber("");
      setExpirationDate("");
      setQuantity("");
      onSuccess();
    } catch {
      alert("Eroare la adăugare lot");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Loturi — {medicationName}
          </DialogTitle>
          <DialogDescription>
            Lista loturi cu număr și dată de expirare. Adăugați un lot nou pentru reaprovizionare.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Se încarcă...</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-800/30">
              {batches.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">Nu există loturi.</p>
              ) : (
                batches.map((b) => (
                  <div
                    key={b.$id}
                    className="flex justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="font-medium">{b.batchNumber}</span>
                    <span className="text-slate-500">Exp: {b.expirationDate}</span>
                    <span className="font-medium">× {b.quantity}</span>
                  </div>
                ))
              )}
            </div>
          )}
          <form onSubmit={handleAddBatch} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Adaugă lot</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Număr lot</Label>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="ex. LOT-2024-001"
                />
              </div>
              <div>
                <Label className="text-xs">Data expirare</Label>
                <Input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Cantitate</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Cantitate"
              />
            </div>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Se adaugă..." : "Adaugă lot"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
