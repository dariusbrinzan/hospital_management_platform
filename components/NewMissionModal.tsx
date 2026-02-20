"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
interface NewMissionModalProps {
  ambulances: Ambulance[];
  onClose: () => void;
  onSuccess: () => void;
}

const missionSchema = z.object({
  ambulanceId: z.string().min(1, "Selectează o ambulanță"),
  priority: z.number().min(1).max(10),
  callerName: z.string().optional(),
  callerPhone: z.string().min(1, "Telefonul apelantului este obligatoriu"),
  pickupLocation: z.string().min(1, "Locația de preluare este obligatorie"),
  patientName: z.string().optional(),
  patientAge: z.string().optional(),
  patientGender: z.string().optional(),
  chiefComplaint: z.string().min(1, "Motivul apelului este obligatoriu"),
  dispatcherName: z.string().min(1, "Numele dispecerului este obligatoriu"),
  notes: z.string().optional(),
});

export const NewMissionModal = ({ ambulances, onClose, onSuccess }: NewMissionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof missionSchema>>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      priority: 5,
      dispatcherName: "Dispecer",
    },
  });

  const onSubmit = async (values: z.infer<typeof missionSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ambulances/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: values.ambulanceId,
          missionType: "emergency",
          priority: values.priority,
          callerName: values.callerName || undefined,
          callerPhone: values.callerPhone,
          pickupLocation: {
            address: values.pickupLocation,
          },
          destinationLocation: {
            address: "Spital eHealth.ro",
          },
          patientName: values.patientName || undefined,
          patientAge: values.patientAge || undefined,
          patientGender: values.patientGender || undefined,
          chiefComplaint: values.chiefComplaint,
          dispatcherName: values.dispatcherName,
          notes: values.notes || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la crearea misiunii");
      }
    } catch (error) {
      console.error("Error creating mission:", error);
      alert("Eroare la crearea misiunii");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Misiune Nouă de Urgență</DialogTitle>
          <DialogDescription>
            Completează informațiile pentru a trimite o ambulanță la locație
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ambulanceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambulanță *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează ambulanța" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ambulances.length > 0 ? (
                        ambulances.map((amb) => (
                          <SelectItem key={amb.$id} value={amb.$id}>
                            {amb.ambulanceNumber} - {amb.licensePlate}
                            {amb.crew.medic && ` (${amb.crew.medic})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-ambulances" disabled>
                          Nu există ambulanțe disponibile
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioritate (1-10, 1 = critic) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="callerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume Apelant</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nume apelant" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="callerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Apelant *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="07XXXXXXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locație Preluare *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Adresa completă" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume Pacient</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nume" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vârstă</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vârstă" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bărbat">Bărbat</SelectItem>
                        <SelectItem value="Femeie">Femeie</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motiv Apel / Simptome *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descriere simptome/complaint" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispatcherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispecer *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nume dispecer" />
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
                    <Input {...field} placeholder="Note suplimentare" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" onClick={onClose} className="shad-gray-btn">
                Anulează
              </Button>
              <Button type="submit" className="shad-primary-btn" disabled={isLoading}>
                {isLoading ? "Se trimite..." : "Trimite Ambulanța"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
