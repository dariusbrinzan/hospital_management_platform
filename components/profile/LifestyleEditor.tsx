"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLifestyle } from "@/lib/actions/profile.actions";
import {
  SmokingStatusOptions,
  AlcoholConsumptionOptions,
  ExerciseFrequencyOptions,
} from "@/constants";

interface Props {
  patientId: string;
  patient: {
    smokingStatus?: string;
    alcoholConsumption?: string;
    exerciseFrequency?: string;
  };
}

const LIFESTYLE_FIELDS = [
  {
    key: "smokingStatus",
    label: "Fumat",
    options: SmokingStatusOptions,
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    colorFn: (v: string) => {
      if (v === "Nefumător") return "border-green-200 bg-green-50";
      if (v === "Fost fumător") return "border-yellow-200 bg-yellow-50";
      return "border-red-200 bg-red-50";
    },
  },
  {
    key: "alcoholConsumption",
    label: "Consum alcool",
    options: AlcoholConsumptionOptions,
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    colorFn: (v: string) => {
      if (v === "Nu consumă") return "border-green-200 bg-green-50";
      if (v === "Consum ocazional") return "border-blue-200 bg-blue-50";
      if (v === "Consum moderat") return "border-yellow-200 bg-yellow-50";
      return "border-red-200 bg-red-50";
    },
  },
  {
    key: "exerciseFrequency",
    label: "Exerciții fizice",
    options: ExerciseFrequencyOptions,
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    colorFn: (v: string) => {
      if (v.includes("Zilnic") || v.includes("3-5")) return "border-green-200 bg-green-50";
      if (v.includes("Ocazional")) return "border-blue-200 bg-blue-50";
      if (v.includes("Rar")) return "border-yellow-200 bg-yellow-50";
      return "border-red-200 bg-red-50";
    },
  },
];

export function LifestyleEditor({ patientId, patient }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    smokingStatus: patient.smokingStatus || "",
    alcoholConsumption: patient.alcoholConsumption || "",
    exerciseFrequency: patient.exerciseFrequency || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateLifestyle(patientId, form);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Stil de viață actualizat!" });
      setIsEditing(false);
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Eroare" });
    }
  };

  return (
    <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
            <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-18-bold text-dark-900">Stil de Viață</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-green-500 px-4 py-2 text-13-semibold text-white transition hover:bg-green-600"
          >
            Editează
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); setMessage(null); }}
              className="rounded-lg border border-dark-200 px-4 py-2 text-13-semibold text-dark-600 hover:bg-gray-50"
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-green-500 px-4 py-2 text-13-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mx-6 mt-4 rounded-lg px-4 py-3 text-13-regular ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        {LIFESTYLE_FIELDS.map(({ key, label, options, icon, colorFn }) => {
          const value = (form as any)[key];
          const colorClass = value ? colorFn(value) : "border-dark-200 bg-gray-50";

          return (
            <div key={key} className={`rounded-xl border-2 p-4 transition ${colorClass}`}>
              <div className="mb-2 flex items-center gap-2 text-dark-600">
                {icon}
                <span className="text-13-semibold">{label}</span>
              </div>
              {isEditing ? (
                <select
                  value={value}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 bg-white px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                >
                  <option value="">Selectează</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <p className="text-16-semibold text-dark-900">{value || "Nespecificat"}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
