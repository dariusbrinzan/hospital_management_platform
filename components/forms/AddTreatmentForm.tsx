"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<{ doctorName: string; specialty?: string }[]>([]);

  useEffect(() => {
    loadDoctorsOnDuty();
  }, []);

  const loadDoctorsOnDuty = async () => {
    try {
      const response = await fetch("/api/emergency/doctors");
      if (response.ok) {
        const data = await response.json();
        // Filtrează medicii activi (disponibili și în perioada de gardă)
        const now = new Date();
        const currentDoctors = data.filter((d: any) => {
          const weekStart = new Date(d.weekStartDate);
          const weekEnd = new Date(d.weekEndDate);
          // Include medicii care sunt în perioada de gardă (trecut sau prezent)
          return d.isAvailable && now <= weekEnd;
        });
        // Extrage doar numele medicilor (unic) - păstrează ultima înregistrare pentru fiecare medic
        const doctorsMap = new Map<string, any>();
        currentDoctors.forEach((d: any) => {
          if (!doctorsMap.has(d.doctorName) || new Date(d.weekStartDate) > new Date(doctorsMap.get(d.doctorName).weekStartDate)) {
            doctorsMap.set(d.doctorName, d);
          }
        });
        const uniqueDoctors = Array.from(doctorsMap.values()).map((d: any) => ({
          doctorName: d.doctorName,
          specialty: d.specialty,
        }));
        setDoctorsOnDuty(uniqueDoctors);
      }
    } catch (error) {
      console.error("Error loading doctors on duty:", error);
    }
  };

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
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează medic de gardă" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsOnDuty.length > 0 ? (
                        doctorsOnDuty.map((doctor) => (
                          <SelectItem key={doctor.doctorName} value={doctor.doctorName}>
                            {doctor.doctorName} {doctor.specialty && `(${doctor.specialty})`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-dark-500">Nu există medici de gardă</div>
                      )}
                    </SelectContent>
                  </Select>
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
