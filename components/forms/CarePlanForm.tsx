"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const carePlanSchema = z.object({
  diagnosis: z.string().min(5, "Diagnosticul este obligatoriu"),
  treatment: z.string().min(5, "Tratamentul este obligatoriu"),
  medications: z.string().optional(),
  followUp: z.string().optional(),
});

interface CarePlanFormProps {
  emergencyCase: EmergencyCase;
  onComplete: () => void;
  onCancel: () => void;
}

export const CarePlanForm = ({ emergencyCase, onComplete, onCancel }: CarePlanFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof carePlanSchema>>({
    resolver: zodResolver(carePlanSchema),
    defaultValues: {
      diagnosis: "",
      treatment: "",
      medications: "",
      followUp: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof carePlanSchema>) => {
    setIsLoading(true);
    try {
      const carePlan = `DIAGNOSTIC:
${values.diagnosis}

TRATAMENT:
${values.treatment}

${values.medications ? `MEDICAMENTE:
${values.medications}

` : ""}${values.followUp ? `URMĂRIRE:
${values.followUp}` : ""}`;

      const response = await fetch(`/api/emergency/${emergencyCase.$id}/care-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carePlan }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la salvarea planului de îngrijire");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare la salvarea planului de îngrijire");
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Plan de Îngrijire</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Diagnostic</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Diagnosticul pacientului..."
                    {...field}
                    className="shad-textArea"
                    rows={3}
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Tratament</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Planul de tratament..."
                    {...field}
                    className="shad-textArea"
                    rows={4}
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Medicamente (opțional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lista de medicamente prescrise..."
                    {...field}
                    className="shad-textArea"
                    rows={3}
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Urmărire (opțional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Recomandări pentru urmărire..."
                    {...field}
                    className="shad-textArea"
                    rows={2}
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="shad-primary-btn"
            >
              {isLoading ? "Salvare..." : "Salvează Plan de Îngrijire"}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              className="shad-gray-btn"
            >
              Anulează
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
