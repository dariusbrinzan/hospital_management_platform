"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";
import { updateAnalysisResults } from "@/lib/actions/appointment.actions";
import { AnalysisPackages } from "@/constants";
import {
  getReferenceRange,
  formatReferenceRange,
  calculateAge,
  isValueInRange,
} from "@/lib/analysis-reference-ranges";
import SubmitButton from "./SubmitButton";

// Schema pentru un singur rezultat de analiză
const AnalysisResultItemSchema = z.object({
  testName: z.string(),
  value: z.string().min(1, "Valoarea este obligatorie"),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  notes: z.string().optional(),
});

const AnalysisResultsSchema = z.object({
  results: z.array(AnalysisResultItemSchema).min(1, "Trebuie să completați cel puțin un rezultat"),
});

export const AnalysisResultsModal = ({
  appointment,
  triggerClassName,
}: {
  appointment: Appointment;
  triggerClassName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Verifică dacă rezultatele au fost deja completate
  const hasResults = appointment.analysisResults && appointment.analysisResults.trim().length > 0;

  // Calculează informații despre pacient pentru intervale de referință
  const patientInfo = useMemo(() => {
    if (!appointment.patient) return null;
    
    const age = calculateAge(appointment.patient.birthDate);
    const gender = appointment.patient.gender as "Bărbat" | "Femeie";
    const weight = (appointment.patient as any).weight || undefined;

    return { age, gender, weight };
  }, [appointment.patient]);

  // Extrage lista de analize din note
  const analysisTests = useMemo(() => {
    if (!appointment.note) return [];
    
    // Caută pachetul de analize în note
    const noteLines = appointment.note.split('\n');
    const analysisLine = noteLines.find(line => line.includes('Analize incluse:'));
    
    if (analysisLine) {
      const testsString = analysisLine.split('Analize incluse:')[1]?.trim();
      if (testsString) {
        return testsString.split(',').map(test => test.trim()).filter(Boolean);
      }
    }
    
    // Dacă nu găsește în note, caută în pachetele disponibile
    // Verifică dacă există rezultate salvate anterior (JSON)
    if (appointment.analysisResults) {
      try {
        const parsed = JSON.parse(appointment.analysisResults);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => r.testName);
        }
      } catch {
        // Nu este JSON, continuă
      }
    }
    
    return [];
  }, [appointment.note, appointment.analysisResults]);

  // Parsează rezultatele existente dacă există
  const existingResults = useMemo(() => {
    if (!appointment.analysisResults) return [];
    
    try {
      const parsed = JSON.parse(appointment.analysisResults);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Nu este JSON, returnează array gol
    }
    
    return [];
  }, [appointment.analysisResults]);

  const form = useForm<z.infer<typeof AnalysisResultsSchema>>({
    resolver: zodResolver(AnalysisResultsSchema),
    defaultValues: {
      results: analysisTests.length > 0
        ? analysisTests.map((test, index) => {
            const existing = existingResults.find((r: any) => r.testName === test);
            // Calculează intervalul de referință automat dacă nu există
            const autoRange = patientInfo
              ? getReferenceRange(test, patientInfo)
              : null;
            const autoRangeFormatted = autoRange ? formatReferenceRange(autoRange) : "";

            return {
              testName: test,
              value: existing?.value || "",
              unit: existing?.unit || "",
              referenceRange: existing?.referenceRange || autoRangeFormatted,
              notes: existing?.notes || "",
            };
          })
        : existingResults.length > 0
        ? existingResults.map((r: any) => {
            // Adaugă intervalul de referință automat dacă lipsește
            if (!r.referenceRange && patientInfo) {
              const autoRange = getReferenceRange(r.testName, patientInfo);
              if (autoRange) {
                r.referenceRange = formatReferenceRange(autoRange);
              }
            }
            return r;
          })
        : [{
            testName: "Rezultate generale",
            value: "",
            unit: "",
            referenceRange: "",
            notes: "",
          }],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "results",
  });

  const onSubmit = async (values: z.infer<typeof AnalysisResultsSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      // Salvează rezultatele ca JSON structurat
      const resultsJson = JSON.stringify(values.results, null, 2);
      await updateAnalysisResults(appointment.$id, resultsJson);
      setOpen(false);
      form.reset();
      window.location.reload(); // Reîmprospătează pagina pentru a afișa rezultatele
    } catch (error: any) {
      console.error("Error updating analysis results:", error);
      setError(error.message || "A apărut o eroare la salvarea rezultatelor");
    } finally {
      setIsLoading(false);
    }
  };

  // Dacă rezultatele au fost deja completate, nu afișa butonul
  if (hasResults) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("rounded-lg text-sm font-medium", triggerClassName ?? "shad-primary-btn text-14-medium")}
        >
          Completează rezultate analize
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>Rezultate Analize Medicale</DialogTitle>
          <DialogDescription>
            Completează rezultatele analizelor pentru {appointment.patient.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-14-regular text-red-600">{error}</p>
              </div>
            )}

            {analysisTests.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-14-regular text-yellow-800 mb-4">
                  Nu s-au găsit informații despre pachetul de analize. Vă rugăm să completați rezultatele manual.
                </p>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-dark-200 bg-white p-4 space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name={`results.${index}.testName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nume Analiză *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: Hemoleucogramă completă"
                                className="shad-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`results.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valoare *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ex: 5.2"
                                  className="shad-input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`results.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unitate de măsură</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ex: g/dL, mmol/L"
                                  className="shad-input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`results.${index}.referenceRange`}
                        render={({ field }) => {
                          const testName = form.watch(`results.${index}.testName`);
                          const value = form.watch(`results.${index}.value`);
                          const autoReferenceRange = patientInfo && testName
                            ? getReferenceRange(testName, patientInfo)
                            : null;
                          const autoRangeFormatted = autoReferenceRange
                            ? formatReferenceRange(autoReferenceRange)
                            : "";
                          const isInRange = value && autoReferenceRange
                            ? isValueInRange(value, autoReferenceRange)
                            : null;

                          // Folosește intervalul calculat automat dacă câmpul este gol
                          const displayValue = field.value || autoRangeFormatted;

                          return (
                            <FormItem>
                              <FormLabel>Interval de referință</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input
                                    placeholder={autoRangeFormatted || "ex: 3.5-5.5 g/dL"}
                                    className="shad-input"
                                    {...field}
                                    value={displayValue}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                  />
                                  {autoReferenceRange && !field.value && (
                                    <div className="text-12-regular text-dark-500 bg-blue-50 p-2 rounded-md">
                                      <span className="font-medium">Interval calculat automat:</span> {autoRangeFormatted}
                                      {autoReferenceRange.note && (
                                        <span className="block text-dark-400 mt-1">{autoReferenceRange.note}</span>
                                      )}
                                    </div>
                                  )}
                                  {value && isInRange !== null && (
                                    <div className={`text-12-semibold p-2 rounded-md ${
                                      isInRange ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                    }`}>
                                      {isInRange ? "✓ Valoare în interval normal" : "⚠ Valoare în afara intervalului normal"}
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name={`results.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observații</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Observații sau comentarii..."
                                className="shad-textArea min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-14-medium text-dark-700">
                  Completează rezultatele pentru fiecare analiză solicitată:
                </p>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-dark-200 bg-white p-4 space-y-4"
                  >
                    <p className="text-16-semibold text-dark-700">
                      {form.watch(`results.${index}.testName`)}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`results.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valoare *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: 5.2"
                                className="shad-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`results.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unitate de măsură</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: g/dL, mmol/L, U/L"
                                className="shad-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`results.${index}.referenceRange`}
                      render={({ field }) => {
                        const testName = form.watch(`results.${index}.testName`);
                        const value = form.watch(`results.${index}.value`);
                        const autoReferenceRange = patientInfo && testName
                          ? getReferenceRange(testName, patientInfo)
                          : null;
                        const autoRangeFormatted = autoReferenceRange
                          ? formatReferenceRange(autoReferenceRange)
                          : "";
                        const isInRange = value && autoReferenceRange
                          ? isValueInRange(value, autoReferenceRange)
                          : null;

                        // Folosește intervalul calculat automat dacă câmpul este gol
                        const displayValue = field.value || autoRangeFormatted;

                        return (
                          <FormItem>
                            <FormLabel>Interval de referință</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  placeholder={autoRangeFormatted || "ex: 3.5-5.5 g/dL"}
                                  className="shad-input"
                                  {...field}
                                  value={displayValue}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                {autoReferenceRange && !field.value && (
                                  <div className="text-12-regular text-dark-500 bg-blue-50 p-2 rounded-md">
                                    <span className="font-medium">Interval calculat automat:</span> {autoRangeFormatted}
                                    {autoReferenceRange.note && (
                                      <span className="block text-dark-400 mt-1">{autoReferenceRange.note}</span>
                                    )}
                                  </div>
                                )}
                                {value && isInRange !== null && (
                                  <div className={`text-12-semibold p-2 rounded-md ${
                                    isInRange ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                  }`}>
                                    {isInRange ? "✓ Valoare în interval normal" : "⚠ Valoare în afara intervalului normal"}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`results.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observații</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observații sau comentarii despre acest rezultat..."
                              className="shad-textArea min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Anulează
              </Button>
              <SubmitButton isLoading={isLoading} className="flex-1">
                Salvează rezultatele
              </SubmitButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
