"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const treatmentSchema = z.object({
  medicationName: z.string().min(1, "Numele medicamentului este obligatoriu"),
  dosage: z.string().min(1, "Doza este obligatorie"),
  frequency: z.string().min(1, "Frecvența este obligatorie"),
  route: z.string().optional(),
  administeredBy: z.string().optional(),
  notes: z.string().optional(),
});

interface AddTreatmentFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTreatmentForm = ({ patientId, onSuccess, onCancel }: AddTreatmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof treatmentSchema>>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {},
  });

  const onSubmit = async (values: z.infer<typeof treatmentSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/icu/patients/${patientId}/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onSuccess();
        form.reset();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la adăugarea tratamentului");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la adăugarea tratamentului");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 bg-gray-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="medicationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nume medicament *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doza *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: 500mg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frecvență *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: 2x pe zi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cale administrare</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ex: IV, oral, etc." />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="administeredBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Administrat de</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Se salvează..." : "Salvează"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anulează
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
