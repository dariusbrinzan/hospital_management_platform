"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmergencyCase } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const consentSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "Consimțământul este obligatoriu",
  }),
  consentType: z.string().min(1, "Selectați tipul de consimțământ"),
  signedBy: z.string().min(1, "Numele semnatarului este obligatoriu"),
});

interface ConsentFormProps {
  emergencyCase: EmergencyCase;
  onComplete: () => void;
  onCancel: () => void;
}

export const ConsentForm = ({ emergencyCase, onComplete, onCancel }: ConsentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof consentSchema>>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      consentGiven: false,
      consentType: "",
      signedBy: emergencyCase.patient?.name || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof consentSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/emergency/${emergencyCase.$id}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentGiven: values.consentGiven,
          consentType: values.consentType,
          signedBy: values.signedBy,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la salvarea consimțământului");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la salvarea consimțământului");
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Consimțământ Informativ</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="consentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Tip Consimțământ</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="shad-select-trigger w-full"
                  >
                    <option value="">Selectează...</option>
                    <option value="treatment">Consimțământ pentru tratament</option>
                    <option value="admission">Consimțământ pentru internare</option>
                    <option value="procedure">Consimțământ pentru procedură medicală</option>
                  </select>
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Semnat de</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="shad-input"
                    placeholder="Nume complet"
                  />
                </FormControl>
                <FormMessage className="shad-error" />
              </FormItem>
            )}
          />

          <div className="rounded-lg border border-dark-200 p-4 bg-dark-50">
            <p className="text-sm text-dark-700 mb-4">
              Prin semnarea acestui document, confirm că am fost informat despre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-dark-600 mb-4">
              <li>Diagnosticul și starea mea medicală</li>
              <li>Tratamentul propus și alternativele disponibile</li>
              <li>Riscurile și beneficiile tratamentului</li>
              <li>Dreptul meu de a refuza tratamentul</li>
            </ul>
          </div>

          <FormField
            control={form.control}
            name="consentGiven"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-200 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-14-medium text-dark-700 cursor-pointer">
                    Confirm că am citit și înțeles informațiile de mai sus și consimt la tratament
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="shad-primary-btn"
            >
              {isLoading ? "Salvare..." : "Salvează Consimțământ"}
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
