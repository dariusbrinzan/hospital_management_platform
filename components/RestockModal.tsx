"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { MedicationStock } from "@/types";

interface RestockModalProps {
  stock: MedicationStock;
  onClose: () => void;
  onSuccess: () => void;
}

const restockSchema = z.object({
  quantity: z.number().min(1, "Cantitatea trebuie să fie cel puțin 1"),
  reason: z.string().optional(),
  performedBy: z.string().min(1, "Numele persoanei este obligatoriu"),
  notes: z.string().optional(),
});

export const RestockModal = ({ stock, onClose, onSuccess }: RestockModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof restockSchema>>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      performedBy: "Farmacist",
      reason: "Reaprovizionare manuală",
    },
  });

  const onSubmit = async (values: z.infer<typeof restockSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/medications/stock/${stock.$id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restock",
          quantity: values.quantity,
          performedBy: values.performedBy,
          reason: values.reason,
          notes: values.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la reaprovizionare");
      }
    } catch (error) {
      console.error("Error restocking:", error);
      alert("Eroare la reaprovizionare");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reaprovizionare Stoc</DialogTitle>
          <DialogDescription>
            Adaugă medicament în stoc pentru {stock.medication?.name || "medicament necunoscut"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg border border-dark-200 bg-gray-50 p-4 mb-4">
              <p className="text-14-semibold text-dark-700 mb-2">Stoc Actual:</p>
              <div className="space-y-1 text-12-regular text-dark-600">
                <p>Total: {stock.quantity} {stock.medication?.unit || ""}</p>
                <p>Disponibil: {stock.availableQuantity || 0} {stock.medication?.unit || ""}</p>
                <p>Rezervat: {stock.reservedQuantity} {stock.medication?.unit || ""}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantitate de adăugat *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="Cantitate"
                    />
                  </FormControl>
                  <p className="text-12-regular text-dark-500">
                    Unitate: {stock.medication?.unit || ""}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Efectuat de *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nume persoană" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motiv</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Motiv reaprovizionare" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Note suplimentare" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" onClick={onClose} className="shad-gray-btn">
                Anulează
              </Button>
              <Button type="submit" className="shad-primary-btn" disabled={isLoading}>
                {isLoading ? "Se salvează..." : "Reaprovizionează"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
