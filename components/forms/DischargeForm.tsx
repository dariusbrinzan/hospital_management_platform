"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const dischargeSchema = z.object({
  dischargeSummary: z.string().min(10, "Rezumatul externării este obligatoriu"),
  recommendations: z.string().min(5, "Recomandările sunt obligatorii"),
  followUpInstructions: z.string().optional(),
});

interface DischargeFormProps {
  emergencyCase: EmergencyCase;
  onComplete: () => void;
  onCancel: () => void;
}

export const DischargeForm = ({ emergencyCase, onComplete, onCancel }: DischargeFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof dischargeSchema>>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      dischargeSummary: "",
      recommendations: "",
      followUpInstructions: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof dischargeSchema>) => {
    setIsLoading(true);
    try {
      const dischargeLetter = `REZUMAT EXTERNARE:
${values.dischargeSummary}

RECOMANDĂRI:
${values.recommendations}

${values.followUpInstructions ? `INSTRUCȚIUNI URMĂRIRE:
${values.followUpInstructions}` : ""}

Data externării: ${new Date().toLocaleDateString("ro-RO")}
Medic responsabil: ${emergencyCase.assignedDoctorId || "N/A"}`;

      const response = await fetch(`/api/emergency/${emergencyCase.$id}/discharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dischargeLetter }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la salvarea scrisorii de externare");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la salvarea scrisorii de externare");
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Scrisoare Medicală la Externare</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="dischargeSummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Rezumat Externare</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Rezumatul cazului, diagnosticul final, tratamentul aplicat..."
                    {...field}
                    className="shad-textArea"
                    rows={5}
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Recomandări</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Recomandări pentru pacient după externare..."
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
            name="followUpInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Instrucțiuni Urmărire (opțional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Când și unde să revină pentru control..."
                    {...field}
                    className="shad-textArea"
                    rows={3}
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
              {isLoading ? "Salvare..." : "Finalizează Externarea"}
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
