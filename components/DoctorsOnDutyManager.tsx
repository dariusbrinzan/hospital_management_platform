"use client";

import { useState, useEffect } from "react";
import { Doctors } from "@/constants";
import Image from "next/image";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface Workload {
  doctorName: string;
  emergencyCount: number;
  scheduledCount: number;
  pendingCount: number;
  highPriorityCount: number;
  workloadScore: number;
  totalLoad: number;
}

export const DoctorsOnDutyManager = () => {
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<any[]>([]);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [maxEmergencies, setMaxEmergencies] = useState(3);
  const [doctorsPerWeek, setDoctorsPerWeek] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Calculează săptămâna curentă
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    setWeekStart(monday.toISOString().split("T")[0]);
    setWeekEnd(sunday.toISOString().split("T")[0]);

    loadDoctorsOnDuty();
    loadWorkloads();
  }, []);

  const loadDoctorsOnDuty = async () => {
    try {
      const response = await fetch("/api/emergency/doctors");
      if (response.ok) {
        const data = await response.json();
        setDoctorsOnDuty(data);
      }
    } catch (error) {
      console.error("Error loading doctors on duty:", error);
    }
  };

  const addDoctorToDuty = async () => {
    if (!selectedDoctor || !weekStart || !weekEnd) {
      alert("Completează toate câmpurile");
      return;
    }

    try {
      const response = await fetch("/api/emergency/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName: selectedDoctor,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          maxConcurrentEmergencies: maxEmergencies,
        }),
      });

      if (response.ok) {
        await loadDoctorsOnDuty();
        setSelectedDoctor("");
      } else {
        alert("Eroare la adăugarea medicului de gardă");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la adăugarea medicului de gardă");
    }
  };

  const loadWorkloads = async () => {
    try {
      const response = await fetch("/api/emergency/rotation");
      if (response.ok) {
        const data = await response.json();
        setWorkloads(data);
      }
    } catch (error) {
      console.error("Error loading workloads:", error);
    }
  };

  const generateAutomaticRotation = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/emergency/rotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorsPerWeek,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Rotație generată cu succes!");
        await loadDoctorsOnDuty();
        await loadWorkloads();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la generarea rotației");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare la generarea rotației");
    } finally {
      setIsGenerating(false);
    }
  };


  const getWorkloadColor = (score: number) => {
    if (score < 5) return "text-green-600 bg-green-50";
    if (score < 15) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="header">Gestionare Medici de Gardă</h2>
          <p className="text-dark-600">
            Configurează medicii care vor fi de gardă pentru săptămâna curentă
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={2}
            max={5}
            value={doctorsPerWeek}
            onChange={(e) => setDoctorsPerWeek(parseInt(e.target.value) || 3)}
            className="shad-input w-24"
            placeholder="Nr. medici"
          />
          <Button
            onClick={generateAutomaticRotation}
            disabled={isGenerating}
            className="shad-primary-btn"
          >
            {isGenerating ? "Se generează..." : "🔄 Generează Rotație Automată"}
          </Button>
        </div>
      </div>

      {/* Workload Overview */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Workload Medici (Curent)</h3>
        <p className="text-sm text-dark-500 mb-4">
          Medici sortați după workload (cel mai puțin ocupat primul)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloads.map((workload) => {
            const doctor = Doctors.find((d) => d.name === workload.doctorName);
            return (
              <div
                key={workload.doctorName}
                className="p-4 border border-dark-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  {doctor && (
                    <div className="relative flex-shrink-0">
                      <div className="size-10 overflow-hidden rounded-full border border-dark-300">
                        <Image
                          src={doctor.image}
                          width={40}
                          height={40}
                          alt="doctor"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-14-semibold truncate">{workload.doctorName}</p>
                    <p className="text-12-regular text-dark-500">{doctor?.specialty}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Urgente active:</span>
                    <span className="font-semibold">{workload.emergencyCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Programări scheduled:</span>
                    <span className="font-semibold">{workload.scheduledCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Programări pending:</span>
                    <span className="font-semibold">{workload.pendingCount}</span>
                  </div>
                  {workload.highPriorityCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Urgente critice:</span>
                      <span className="font-semibold text-red-600">{workload.highPriorityCount}</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-dark-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-dark-700">Workload Score:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getWorkloadColor(workload.workloadScore)}`}>
                        {workload.workloadScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Adaugă Medic de Gardă</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="shad-select-trigger">
              <SelectValue placeholder="Selectează medic" />
            </SelectTrigger>
            <SelectContent className="shad-select-content">
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="shad-input"
            placeholder="Data început"
          />

          <Input
            type="date"
            value={weekEnd}
            onChange={(e) => setWeekEnd(e.target.value)}
            className="shad-input"
            placeholder="Data sfârșit"
          />

          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={10}
              value={maxEmergencies}
              onChange={(e) => setMaxEmergencies(parseInt(e.target.value))}
              className="shad-input"
              placeholder="Max urgente"
            />
            <Button onClick={addDoctorToDuty} className="shad-primary-btn">
              Adaugă
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Medici de Gardă Activi</h3>
        <div className="space-y-2">
          {doctorsOnDuty.map((duty) => {
            const doctor = Doctors.find((d) => d.name === duty.doctorName);
            return (
              <div
                key={duty.$id}
                className="flex items-center justify-between p-4 border border-dark-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {doctor && (
                    <div className="relative flex-shrink-0">
                      <div className="size-12 overflow-hidden rounded-full border-2 border-green-500">
                        <Image
                          src={doctor.image}
                          width={48}
                          height={48}
                          alt="doctor"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-16-semibold">{duty.doctorName}</p>
                    <p className="text-14-regular text-dark-500">
                      {doctor?.specialty} • Max {duty.maxConcurrentEmergencies} urgente simultane
                    </p>
                    <p className="text-12-regular text-dark-400">
                      {new Date(duty.weekStartDate).toLocaleDateString("ro-RO")} - {new Date(duty.weekEndDate).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {doctorsOnDuty.length === 0 && (
            <p className="text-center text-dark-500 py-8">
              Nu există medici de gardă configurați
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
