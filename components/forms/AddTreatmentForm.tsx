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
import { toast } from "sonner";

const treatmentSchema = z.object({
  medicationStockId: z.string().min(1, "Selectează un medicament"),
  medicationName: z.string().min(1, "Numele medicamentului este obligatoriu"),
  dosage: z.string().min(1, "Doza este obligatorie"),
  quantity: z.number().min(0.01, "Cantitatea este obligatorie"),
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
  const [availableMedications, setAvailableMedications] = useState<Array<{
    $id: string;
    medication: {
      $id: string;
      name: string;
      strength?: string | null;
      unit: string;
    };
    availableQuantity: number;
  }>>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>("");

  useEffect(() => {
    loadDoctorsOnDuty();
    loadAvailableMedications();
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

  const loadAvailableMedications = async () => {
    try {
      const response = await fetch("/api/medications/stock?location=icu_ward&available=true");
      if (response.ok) {
        const data = await response.json();
        setAvailableMedications(data);
      }
    } catch (error) {
      console.error("Error loading available medications:", error);
    }
  };

  const form = useForm<z.infer<typeof treatmentSchema>>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const watchedMedication = form.watch("medicationStockId");
  
  useEffect(() => {
    if (watchedMedication) {
      const selected = availableMedications.find((m) => m.$id === watchedMedication);
      if (selected) {
        form.setValue("medicationName", selected.medication.name);
        // Auto-populează doza cu strength-ul medicamentului dacă există
        if (selected.medication.strength) {
          form.setValue("dosage", selected.medication.strength);
        }
      }
    }
  }, [watchedMedication, availableMedications, form]);

  const onSubmit = async (values: z.infer<typeof treatmentSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/icu/patients/${patientId}/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationStockId: values.medicationStockId,
          medicationName: values.medicationName,
          dosage: values.dosage,
          quantity: values.quantity,
          frequency: values.frequency,
          route: values.route,
          administeredBy: values.administeredBy,
          notes: values.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
        form.reset();
        setSelectedMedication("");
        // Reîncarcă medicamentele disponibile pentru a actualiza stocul
        loadAvailableMedications();
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la adăugarea tratamentului");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare la adăugarea tratamentului");
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
            name="medicationStockId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicament / Perfuzie *</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedMedication(value);
                  }} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează medicament din stoc" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMedications.length > 0 ? (
                        availableMedications.map((stock) => (
                          <SelectItem key={stock.$id} value={stock.$id}>
                            {stock.medication.name}
                            {stock.medication.strength && ` (${stock.medication.strength})`}
                            {` - Disponibil: ${stock.availableQuantity} ${stock.medication.unit}`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-dark-500">Nu există medicamente disponibile în stoc</div>
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
            name="medicationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nume medicament *</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantitate utilizată *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="ex: 1"
                  />
                </FormControl>
                {selectedMedication && (() => {
                  const selected = availableMedications.find((m) => m.$id === selectedMedication);
                  return selected && (
                    <p className="text-12-regular text-dark-500">
                      Disponibil: {selected.availableQuantity} {selected.medication.unit}
                    </p>
                  );
                })()}
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
