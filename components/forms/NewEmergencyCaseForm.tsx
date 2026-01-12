"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SubmitButton from "@/components/SubmitButton";
import { patientHelpers } from "@/lib/db-helpers";

const emergencyCaseSchema = z.object({
  patientId: z.string().min(1, "Selectați un pacient"),
  triageLevel: z.enum(["critic", "urgent", "normal"]),
  priority: z.number().min(1).max(5),
  chiefComplaint: z.string().min(5, "Descrieți motivul prezentării"),
  bloodPressure: z.string().optional(),
  pulse: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  respiratoryRate: z.number().optional(),
});

export const NewEmergencyCaseForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof emergencyCaseSchema>>({
    resolver: zodResolver(emergencyCaseSchema),
    defaultValues: {
      triageLevel: "normal",
      priority: 3,
      chiefComplaint: "",
    },
  });

  // TODO: Implementare căutare pacienți
  // Pentru moment, vom folosi un input simplu pentru patientId

  const onSubmit = async (values: z.infer<typeof emergencyCaseSchema>) => {
    setIsLoading(true);
    try {
      const vitalSigns = {
        bloodPressure: values.bloodPressure,
        pulse: values.pulse,
        temperature: values.temperature,
        oxygenSaturation: values.oxygenSaturation,
        respiratoryRate: values.respiratoryRate,
      };

      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: values.patientId,
          triageLevel: values.triageLevel,
          priority: values.priority,
          chiefComplaint: values.chiefComplaint,
          vitalSigns: Object.keys(vitalSigns).some((k) => vitalSigns[k as keyof typeof vitalSigns]) ? vitalSigns : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/emergency/${data.id}`);
      } else {
        alert("Eroare la crearea cazului de urgență");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la crearea cazului de urgență");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-input-label">Pacient</FormLabel>
              <FormControl>
                <Input
                  placeholder="ID pacient sau nume"
                  {...field}
                  className="shad-input"
                />
              </FormControl>
              <FormMessage className="shad-error" />
              <p className="text-xs text-dark-500">
                Introduceți ID-ul pacientului sau căutați după nume
              </p>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="triageLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-input-label">Nivel Triaj</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="shad-select-trigger">
                      <SelectValue placeholder="Selectează nivelul" />
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
                <p className="text-xs text-dark-500">1 = cel mai critic, 5 = cel mai puțin critic</p>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chiefComplaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-input-label">Motiv Prezentare</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrieți simptomele și motivul prezentării..."
                  {...field}
                  className="shad-textArea"
                  rows={4}
                />
              </FormControl>
              <FormMessage className="shad-error" />
            </FormItem>
          )}
        />

        <div className="border-t border-dark-200 pt-6">
          <h3 className="text-16-semibold mb-4">Semne Vitale (opțional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bloodPressure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Tensiune Arterială</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: 120/80"
                      {...field}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pulse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-input-label">Puls (bpm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ex: 72"
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
                  <FormLabel className="shad-input-label">Temperatură (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="ex: 36.5"
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
                  <FormLabel className="shad-input-label">Saturație O2 (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ex: 98"
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
                  <FormLabel className="shad-input-label">Frecvență Respiratorie</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ex: 16"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="shad-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <SubmitButton
          isLoading={isLoading}
          className="shad-primary-btn w-full"
        >
          Creează Caz de Urgență
        </SubmitButton>
      </form>
    </Form>
  );
};
