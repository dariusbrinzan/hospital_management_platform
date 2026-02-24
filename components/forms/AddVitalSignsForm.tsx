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

const vitalSignsSchema = z.object({
  bloodPressureSystolic: z.number().optional(),
  bloodPressureDiastolic: z.number().optional(),
  pulse: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  respiratoryRate: z.number().optional(),
  glucoseLevel: z.number().optional(),
  consciousnessLevel: z.enum(["conscious", "drowsy", "unconscious"]).optional(),
  notes: z.string().optional(),
  recordedBy: z.string().optional(),
});

interface AddVitalSignsFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddVitalSignsForm = ({ patientId, onSuccess, onCancel }: AddVitalSignsFormProps) => {
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

  const form = useForm<z.infer<typeof vitalSignsSchema>>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {},
  });

  const onSubmit = async (values: z.infer<typeof vitalSignsSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/icu/patients/${patientId}/vital-signs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onSuccess();
        form.reset();
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la adăugarea semnelor vitale");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare la adăugarea semnelor vitale");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 bg-gray-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bloodPressureSystolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tensiune Sistolică</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodPressureDiastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tensiune Diastolică</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                  <FormLabel>Puls (bpm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                  <FormLabel>Temperatură (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                  <FormLabel>Saturație O2 (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                  <FormLabel>Frecvență Respiratorie</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="glucoseLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glicemie (mg/dL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consciousnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel conștiență</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conscious">Conștient</SelectItem>
                        <SelectItem value="drowsy">Adormit</SelectItem>
                        <SelectItem value="unconscious">Inconștient</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="recordedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Înregistrat de</FormLabel>
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
