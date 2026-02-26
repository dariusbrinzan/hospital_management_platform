"use client";

import { EmergencyCaseCard } from "./EmergencyCaseCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EmergencyKanbanBoardProps {
  cases: EmergencyCase[];
}

const states: { key: EmergencyState; label: string; bg: string; border: string; header: string }[] = [
  { key: "arrival", label: "Prezentare", bg: "bg-slate-50 dark:bg-slate-900/40", border: "border-slate-200 dark:border-slate-700", header: "text-blue-700 dark:text-blue-400" },
  { key: "triage", label: "Triaj", bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", header: "text-amber-800 dark:text-amber-300" },
  { key: "consent", label: "Consimțământ", bg: "bg-violet-50/80 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", header: "text-violet-800 dark:text-violet-300" },
  { key: "admission", label: "Internare", bg: "bg-orange-50/80 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", header: "text-orange-800 dark:text-orange-300" },
  { key: "treatment", label: "Tratament", bg: "bg-rose-50/80 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", header: "text-rose-800 dark:text-rose-300" },
  { key: "icu", label: "ATI", bg: "bg-pink-50/80 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", header: "text-pink-800 dark:text-pink-300" },
  { key: "discharge", label: "Externare", bg: "bg-emerald-50/80 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", header: "text-emerald-800 dark:text-emerald-300" },
];

export const EmergencyKanbanBoard = ({ cases }: EmergencyKanbanBoardProps) => {
  const casesByState = states.reduce((acc, state) => {
    acc[state.key] = cases.filter((c) => c.currentState === state.key);
    return acc;
  }, {} as Record<EmergencyState, EmergencyCase[]>);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {states.map((state) => {
          const stateCases = casesByState[state.key] || [];
          const criticCount = stateCases.filter((c) => c.priority === 1 || c.triageLevel === "critic").length;
          const urgentCount = stateCases.filter((c) => c.priority === 2 || c.triageLevel === "urgent").length;

          return (
            <Card
              key={state.key}
              className={`flex w-80 flex-shrink-0 flex-col overflow-hidden border-2 ${state.border} ${state.bg} shadow-sm`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200/80 py-3 dark:border-slate-700">
                <h3 className={`text-sm font-semibold ${state.header}`}>{state.label}</h3>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                  {stateCases.length}
                </span>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 max-h-[580px]">
                {criticCount > 0 && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Critice: {criticCount}
                  </p>
                )}
                {urgentCount > 0 && criticCount === 0 && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Urgente: {urgentCount}
                  </p>
                )}
                {stateCases
                  .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5))
                  .map((emergencyCase) => (
                    <EmergencyCaseCard key={emergencyCase.$id} emergencyCase={emergencyCase} />
                  ))}
                {stateCases.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nu există cazuri
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
