"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmergencyCase } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const triageSchema = z.object({
  triageLevel: z.enum(["critic", "urgent", "normal"]),
  priority: z.number().min(1).max(5),
  bloodPressure: z.string().optional(),
  pulse: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  respiratoryRate: z.number().optional(),
  observations: z.string().min(5, "Adăugați observații"),
});

interface TriageFormProps {
  emergencyCase: EmergencyCase;
  onComplete: () => void;
  onCancel: () => void;
}

export const TriageForm = ({ emergencyCase, onComplete, onCancel }: TriageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof triageSchema>>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      triageLevel: emergencyCase.triageLevel,
      priority: emergencyCase.priority,
      observations: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof triageSchema>) => {
    setIsLoading(true);
    try {
      const vitalSigns = {
        bloodPressure: values.bloodPressure,
        pulse: values.pulse,
        temperature: values.temperature,
        oxygenSaturation: values.oxygenSaturation,
        respiratoryRate: values.respiratoryRate,
      };

      const response = await fetch(`/api/emergency/${emergencyCase.$id}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triageLevel: values.triageLevel,
          priority: values.priority,
          vitalSigns,
          observations: values.observations,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la salvarea triajului");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la salvarea triajului");
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Formular Triaj</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="triageLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Nivel Triaj</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="shad-select-trigger">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="shad-select-content">
                        <SelectItem value="critic">🔴 Critic</SelectItem>
                        <SelectItem value="urgent">🟠 Urgent</SelectItem>
                        <SelectItem value="normal">🔵 Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="shad-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Prioritate (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="shad-input"
                    />
                  </FormControl>
                  <FormMessage className="shad-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="bloodPressure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Tensiune</FormLabel>
                  <FormControl>
                    <Input placeholder="120/80" {...field} className="shad-input" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pulse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Puls</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="72"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Temperatură</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="oxygenSaturation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Sat O2</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="98"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respiratoryRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Frecv. Resp.</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="16"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Observații Triaj</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observații despre starea pacientului..."
                    {...field}
                    className="shad-textArea"
                    rows={4}
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
              {isLoading ? "Salvare..." : "Salvează Triaj"}
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
