import { formatDateTime } from "@/lib/utils";

const PHASE_META: Record<
  MedicationAdministrationPhase,
  { label: string; badge: string; description: string }
> = {
  before_doctor: {
    label: "Înainte de medic",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    description: "Administrare efectuată în UPU înainte de preluarea de către medicul curant.",
  },
  doctor_care: {
    label: "În grija medicului",
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
    description: "Administrare realizată după ce pacientul a intrat în grija medicului.",
  },
};

interface MedicationAdministrationTimelineProps {
  entries: PatientMedicationAdministration[];
  emptyMessage?: string;
  chronological?: boolean;
}

export function MedicationAdministrationTimeline({
  entries,
  emptyMessage = "Nu există administrări medicamentoase înregistrate.",
  chronological = true,
}: MedicationAdministrationTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const diff =
      new Date(a.administeredAt).getTime() - new Date(b.administeredAt).getTime();
    return chronological ? diff : -diff;
  });

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => {
        const phaseMeta = PHASE_META[entry.administrationPhase];
        return (
          <div
            key={entry.$id}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {entry.medicationName}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${phaseMeta.badge}`}
                  >
                    {phaseMeta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {phaseMeta.description}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateTime(entry.administeredAt).dateTime}
                </p>
                {entry.administeredBy && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrat de {entry.administeredBy}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              <p>
                <span className="font-medium">Doză:</span> {entry.dosage}
              </p>
              <p>
                <span className="font-medium">Cantitate:</span> {entry.quantity}{" "}
                {entry.unit || ""}
              </p>
              <p>
                <span className="font-medium">Cale:</span> {entry.route || "Nespecificată"}
              </p>
              <p>
                <span className="font-medium">Sursă stoc:</span>{" "}
                {entry.stockLocation || "Neasociată"}
              </p>
            </div>

            {entry.notes && (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <span className="font-medium">Observații:</span> {entry.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
