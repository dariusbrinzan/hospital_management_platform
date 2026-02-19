"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMedicalProfile } from "@/lib/actions/profile.actions";
import { BloodTypes } from "@/constants";

interface Props {
  patientId: string;
  patient: {
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    currentMedication?: string;
    chronicDiseases?: string;
    cardiovascularDiseases?: string;
    pastMedicalHistory?: string;
    familyMedicalHistory?: string;
    surgeries?: string;
  };
}

export function MedicalProfileEditor({ patientId, patient }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    bloodType: patient.bloodType || "",
    height: patient.height || "",
    weight: patient.weight || "",
    allergies: patient.allergies || "",
    currentMedication: patient.currentMedication || "",
    chronicDiseases: patient.chronicDiseases || "",
    cardiovascularDiseases: patient.cardiovascularDiseases || "",
    pastMedicalHistory: patient.pastMedicalHistory || "",
    familyMedicalHistory: patient.familyMedicalHistory || "",
    surgeries: patient.surgeries || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateMedicalProfile(patientId, {
      bloodType: form.bloodType || undefined,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      allergies: form.allergies || undefined,
      currentMedication: form.currentMedication || undefined,
      chronicDiseases: form.chronicDiseases || undefined,
      cardiovascularDiseases: form.cardiovascularDiseases || undefined,
      pastMedicalHistory: form.pastMedicalHistory || undefined,
      familyMedicalHistory: form.familyMedicalHistory || undefined,
      surgeries: form.surgeries || undefined,
    });
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Profil medical actualizat cu succes!" });
      setIsEditing(false);
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Eroare la salvare" });
    }
  };

  const bmi = form.height && form.weight
    ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-green-50">
            <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-18-bold text-dark-900">Profil Medical</h2>
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
              className="rounded-lg border border-dark-200 px-4 py-2 text-13-semibold text-dark-600 transition hover:bg-gray-50"
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-green-500 px-4 py-2 text-13-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
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

      <div className="p-6">
        {/* Parametri fizici */}
        <div className="mb-6">
          <h3 className="text-14-semibold text-dark-700 mb-3">Parametri Fizici</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Grupa sanguină</label>
              {isEditing ? (
                <select
                  value={form.bloodType}
                  onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                >
                  <option value="">Selectează</option>
                  {BloodTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-14-medium text-dark-800">
                  {form.bloodType || "—"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Înălțime (cm)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder="175"
                />
              ) : (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-14-medium text-dark-800">
                  {form.height ? `${form.height} cm` : "—"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Greutate (kg)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder="75"
                />
              ) : (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-14-medium text-dark-800">
                  {form.weight ? `${form.weight} kg` : "—"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">IMC</label>
              <p className={`rounded-lg px-3 py-2 text-14-medium ${
                bmi ? (Number(bmi) < 18.5 || Number(bmi) > 30 ? "bg-red-50 text-red-700" : Number(bmi) > 25 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700") : "bg-gray-50 text-dark-800"
              }`}>
                {bmi || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Texte medicale */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { key: "allergies", label: "Alergii (text liber)", placeholder: "ex: Penicilină, Aspirină..." },
            { key: "currentMedication", label: "Medicație curentă", placeholder: "ex: Metformin 500mg, Enalapril 10mg..." },
            { key: "chronicDiseases", label: "Boli cronice", placeholder: "ex: Diabet tip 2, Hipertensiune..." },
            { key: "cardiovascularDiseases", label: "Boli cardiovasculare", placeholder: "ex: Fibrilație atrială..." },
            { key: "pastMedicalHistory", label: "Istoric medical", placeholder: "Afecțiuni și tratamente anterioare..." },
            { key: "familyMedicalHistory", label: "Istoric familial", placeholder: "Afecțiuni în familie..." },
            { key: "surgeries", label: "Intervenții chirurgicale", placeholder: "ex: Apendicectomie 2018..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-12-regular text-dark-500">{label}</label>
              {isEditing ? (
                <textarea
                  value={(form as any)[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder={placeholder}
                />
              ) : (
                <p className="min-h-[60px] whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-14-regular text-dark-700">
                  {(form as any)[key] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
