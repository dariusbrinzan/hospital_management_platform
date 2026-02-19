"use client";

import { formatDateTime } from "@/lib/utils";

interface ActivePrescription {
  $id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  instructions?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  status: string;
}

interface Props {
  activePrescriptions: ActivePrescription[];
  currentMedicationText: string;
}

export function CurrentMedicationEditor({ activePrescriptions, currentMedicationText }: Props) {
  return (
    <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
            <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-18-bold text-dark-900">Medicație Curentă</h2>
            <p className="text-12-regular text-dark-500">
              {activePrescriptions.length} prescripții active
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Active prescriptions from medical records */}
        {activePrescriptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-14-semibold text-dark-700 mb-3">Prescripții Active (din consultații)</h3>
            <div className="space-y-3">
              {activePrescriptions.map((rx) => {
                const endDate = rx.endDate ? new Date(rx.endDate.toString()) : null;
                const isExpiring = endDate && endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                return (
                  <div
                    key={rx.$id}
                    className={`rounded-lg border p-4 ${
                      isExpiring ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-14-semibold text-dark-900">{rx.medicationName}</h4>
                          {isExpiring && (
                            <span className="rounded-full bg-orange-200 px-2 py-0.5 text-11-medium text-orange-800">
                              Expiră curând
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-13-regular text-dark-600">
                          {rx.dosage} — {rx.frequency}
                        </p>
                        {rx.route && (
                          <p className="text-12-regular text-dark-500">Cale: {rx.route}</p>
                        )}
                        {rx.instructions && (
                          <p className="mt-1 text-12-regular text-dark-500 italic">{rx.instructions}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-12-regular text-dark-500">
                          Din: {formatDateTime(rx.startDate).dateOnly}
                        </p>
                        {rx.endDate && (
                          <p className="text-12-regular text-dark-500">
                            Până: {formatDateTime(rx.endDate).dateOnly}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Free text medication from patient profile */}
        {currentMedicationText && (
          <div>
            <h3 className="text-14-semibold text-dark-700 mb-2">Medicamente notate de pacient</h3>
            <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-14-regular text-dark-600">
              {currentMedicationText}
            </p>
            <p className="mt-2 text-12-regular text-dark-400 italic">
              Poți edita acest text din secțiunea &quot;Profil Medical&quot; de mai sus.
            </p>
          </div>
        )}

        {activePrescriptions.length === 0 && !currentMedicationText && (
          <p className="py-8 text-center text-14-regular text-dark-400">
            Nu există medicație curentă înregistrată.
          </p>
        )}
      </div>
    </div>
  );
}
