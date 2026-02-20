"use client";

import { EmergencyCaseCard } from "./EmergencyCaseCard";

interface EmergencyKanbanBoardProps {
  cases: EmergencyCase[];
}

const states: { key: EmergencyState; label: string; color: string }[] = [
  { key: "arrival", label: "Prezentare", color: "bg-blue-100 border-blue-300" },
  { key: "triage", label: "Triaj", color: "bg-yellow-100 border-yellow-300" },
  { key: "consent", label: "Consimțământ", color: "bg-purple-100 border-purple-300" },
  { key: "admission", label: "Internare", color: "bg-orange-100 border-orange-300" },
  { key: "treatment", label: "Tratament", color: "bg-red-100 border-red-300" },
  { key: "icu", label: "ATI", color: "bg-pink-100 border-pink-300" },
  { key: "discharge", label: "Externare", color: "bg-green-100 border-green-300" },
];

export const EmergencyKanbanBoard = ({ cases }: EmergencyKanbanBoardProps) => {
  const casesByState = states.reduce((acc, state) => {
    acc[state.key] = cases.filter((c) => c.currentState === state.key);
    return acc;
  }, {} as Record<EmergencyState, EmergencyCase[]>);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {states.map((state) => {
          const stateCases = casesByState[state.key] || [];
          const priorityCounts = {
            critic: stateCases.filter((c) => c.priority === 1).length,
            urgent: stateCases.filter((c) => c.priority === 2).length,
            normal: stateCases.filter((c) => c.priority >= 3).length,
          };

          return (
            <div
              key={state.key}
              className={`flex flex-col w-80 rounded-lg border-2 ${state.color} p-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-16-semibold">{state.label}</h3>
                <span className="text-14-medium bg-white px-2 py-1 rounded-full">
                  {stateCases.length}
                </span>
              </div>

              {priorityCounts.critic > 0 && (
                <div className="mb-2 text-xs font-semibold text-red-700">
                  🔴 Critic: {priorityCounts.critic}
                </div>
              )}
              {priorityCounts.urgent > 0 && (
                <div className="mb-2 text-xs font-semibold text-orange-700">
                  🟠 Urgent: {priorityCounts.urgent}
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px]">
                {stateCases
                  .sort((a, b) => a.priority - b.priority)
                  .map((emergencyCase) => (
                    <EmergencyCaseCard
                      key={emergencyCase.$id}
                      emergencyCase={emergencyCase}
                    />
                  ))}
                {stateCases.length === 0 && (
                  <div className="text-center text-14-regular text-dark-500 py-8">
                    Nu există cazuri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
