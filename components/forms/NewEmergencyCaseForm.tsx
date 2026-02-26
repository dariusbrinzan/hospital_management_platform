"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SubmitButton from "@/components/SubmitButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { searchPatients } from "@/lib/actions/patient.actions";
import { toast } from "sonner";

const emergencyCaseSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientAge: z.string().optional(),
  patientGender: z.string().optional(),
  triageLevel: z.enum(["critic", "urgent", "normal"]),
  priority: z.number().min(1).max(5),
  chiefComplaint: z.string().min(5, "Descrieți motivul prezentării"),
  bloodPressure: z.string().optional(),
  pulse: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  respiratoryRate: z.number().optional(),
}).refine((data) => {
  // Fie patientId, fie patientName trebuie să fie completat
  return data.patientId || data.patientName;
}, {
  message: "Selectați un pacient existent sau introduceți datele pacientului",
  path: ["patientId"],
});

type PatientOption = { $id: string; name: string };

export const NewEmergencyCaseForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [useExistingPatient, setUseExistingPatient] = useState(true);

  const form = useForm<z.infer<typeof emergencyCaseSchema>>({
    resolver: zodResolver(emergencyCaseSchema),
    defaultValues: {
      triageLevel: "normal",
      priority: 3,
      chiefComplaint: "",
    },
  });

  useEffect(() => {
    if (!useExistingPatient || !patientQuery.trim()) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPatients(patientQuery.trim()).then((list: any[]) =>
        setPatientResults((list || []).map((p) => ({ $id: p.$id, name: p.name })))
      );
    }, 300);
    return () => clearTimeout(t);
  }, [useExistingPatient, patientQuery]);

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
      const patientId = useExistingPatient ? (selectedPatient?.$id ?? values.patientId) : null;

      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId || null,
          patientName: !useExistingPatient ? values.patientName : undefined,
          patientPhone: !useExistingPatient ? values.patientPhone : undefined,
          patientAge: !useExistingPatient ? values.patientAge : undefined,
          patientGender: !useExistingPatient ? values.patientGender : undefined,
          triageLevel: values.triageLevel,
          priority: values.priority,
          chiefComplaint: values.chiefComplaint,
          vitalSigns: Object.keys(vitalSigns).some((k) => vitalSigns[k as keyof typeof vitalSigns]) ? vitalSigns : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/emergency/${data.id}`);
        toast.success("Caz creat. Redirecționare...");
      } else {
        toast.error("Eroare la crearea cazului de urgență");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare la crearea cazului de urgență");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Identificare pacient</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pacient existent în sistem (căutare după nume) sau date pentru pacient nou.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useExistingPatient}
                  onChange={() => {
                    setUseExistingPatient(true);
                    setSelectedPatient(null);
                    setPatientQuery("");
                    form.setValue("patientId", "");
                    form.setValue("patientName", "");
                    form.setValue("patientPhone", "");
                    form.setValue("patientAge", "");
                    form.setValue("patientGender", "");
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pacient existent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useExistingPatient}
                  onChange={() => {
                    setUseExistingPatient(false);
                    setSelectedPatient(null);
                    setPatientQuery("");
                    form.setValue("patientId", "");
                    form.setValue("patientName", "");
                    form.setValue("patientPhone", "");
                    form.setValue("patientAge", "");
                    form.setValue("patientGender", "");
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pacient nou (nu e în sistem)</span>
              </label>
            </div>

            {useExistingPatient ? (
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Pacient</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {selectedPatient ? (
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPatient.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatient(null);
                                setPatientQuery("");
                                field.onChange("");
                              }}
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Schimbă
                            </button>
                          </div>
                        ) : (
                          <>
                            <Input
                              placeholder="Caută după nume, email..."
                              value={patientQuery}
                              onChange={(e) => {
                                setPatientQuery(e.target.value);
                                field.onChange("");
                              }}
                              className="rounded-lg border-slate-300 dark:border-slate-600"
                            />
                            {patientResults.length > 0 && (
                              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                {patientResults.map((p) => (
                                  <li key={p.$id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedPatient(p);
                                        setPatientQuery(p.name);
                                        setPatientResults([]);
                                        field.onChange(p.$id);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                    >
                                      {p.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600 dark:text-red-400" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Nume pacient *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nume complet"
                        {...field}
                        className="shad-input"
                      />
                    </FormControl>
                    <FormMessage className="shad-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-input-label">Telefon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Număr de telefon"
                        {...field}
                        className="shad-input"
                      />
                    </FormControl>
                    <FormMessage className="shad-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-input-label">Vârstă</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vârstă (ani)"
                        {...field}
                        className="shad-input"
                      />
                    </FormControl>
                    <FormMessage className="shad-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-input-label">Gen</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="shad-select-trigger">
                          <SelectValue placeholder="Selectează genul" />
                        </SelectTrigger>
                        <SelectContent className="shad-select-content">
                          <SelectItem value="Bărbat">Bărbat</SelectItem>
                          <SelectItem value="Femeie">Femeie</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="shad-error" />
                  </FormItem>
                )}
              />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Triaj și motiv prezentare</h3>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v ? parseInt(v, 10) : undefined);
                    }}
                    className="rounded-lg border-slate-300 dark:border-slate-600"
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
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Motiv prezentare *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrieți simptomele și motivul prezentării..."
                  {...field}
                  className="min-h-[100px] rounded-lg border-slate-300 dark:border-slate-600"
                  rows={4}
                />
              </FormControl>
              <FormMessage className="text-red-600 dark:text-red-400" />
            </FormItem>
          )}
        />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Semne vitale (opțional)</h3>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </CardContent>
        </Card>

        <SubmitButton isLoading={isLoading} className="w-full rounded-lg bg-teal-600 hover:bg-teal-700">
          Creează caz de urgență
        </SubmitButton>
      </form>
    </Form>
  );
};
