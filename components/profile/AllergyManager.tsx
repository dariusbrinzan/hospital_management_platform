"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAllergy, updateAllergy, deleteAllergy } from "@/lib/actions/profile.actions";

interface Allergy {
  $id: string;
  allergenType: string;
  allergenName: string;
  reactionType: string;
  severity: string;
  symptoms?: string | null;
  status: string;
  notes?: string | null;
  reportedBy?: string | null;
  createdAt: Date | string;
}

interface Props {
  patientId: string;
  allergies: Allergy[];
}

const ALLERGEN_TYPES = [
  { value: "medication", label: "Medicament" },
  { value: "food", label: "Aliment" },
  { value: "environmental", label: "Mediu" },
  { value: "other", label: "Altele" },
];

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Ușoară", color: "bg-yellow-100 text-yellow-800" },
  { value: "moderate", label: "Moderată", color: "bg-orange-100 text-orange-800" },
  { value: "severe", label: "Severă", color: "bg-red-100 text-red-800" },
  { value: "life_threatening", label: "Pericol vital", color: "bg-red-200 text-red-900" },
];

const REACTION_TYPES = [
  { value: "allergy", label: "Alergie" },
  { value: "intolerance", label: "Intoleranță" },
  { value: "adverse_reaction", label: "Reacție adversă" },
];

const emptyForm = {
  allergenType: "medication",
  allergenName: "",
  reactionType: "allergy",
  severity: "mild",
  symptoms: "",
  notes: "",
};

export function AllergyManager({ patientId, allergies }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeAllergies = allergies.filter((a) => a.status === "active");
  const resolvedAllergies = allergies.filter((a) => a.status !== "active");

  const handleSubmit = async () => {
    if (!form.allergenName.trim()) {
      setMessage({ type: "error", text: "Numele alergenului este obligatoriu" });
      return;
    }
    setSaving(true);
    setMessage(null);

    let result;
    if (editingId) {
      result = await updateAllergy(editingId, form);
    } else {
      result = await addAllergy(patientId, form);
    }

    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: editingId ? "Alergie actualizată!" : "Alergie adăugată!" });
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Eroare" });
    }
  };

  const handleEdit = (allergy: Allergy) => {
    setEditingId(allergy.$id);
    setForm({
      allergenType: allergy.allergenType,
      allergenName: allergy.allergenName,
      reactionType: allergy.reactionType,
      severity: allergy.severity,
      symptoms: allergy.symptoms || "",
      notes: allergy.notes || "",
    });
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi această alergie?")) return;
    setDeletingId(id);
    const result = await deleteAllergy(id);
    setDeletingId(null);
    if (result.success) {
      setMessage({ type: "success", text: "Alergie ștearsă!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Eroare la ștergere" });
    }
  };

  const handleResolve = async (id: string) => {
    const result = await updateAllergy(id, { status: "resolved" });
    if (result.success) {
      router.refresh();
    }
  };

  const getSeverityBadge = (severity: string) => {
    const opt = SEVERITY_OPTIONS.find((s) => s.value === severity);
    return opt || { label: severity, color: "bg-gray-100 text-gray-800" };
  };

  const getAllergenTypeLabel = (type: string) => {
    return ALLERGEN_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getAllergenTypeIcon = (type: string) => {
    switch (type) {
      case "medication": return "💊";
      case "food": return "🍽️";
      case "environmental": return "🌿";
      default: return "⚠️";
    }
  };

  return (
    <div className="rounded-xl border border-dark-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-50">
            <svg className="size-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-18-bold text-dark-900">Alergii și Reacții Adverse</h2>
            <p className="text-12-regular text-dark-500">{activeAllergies.length} active</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
            setMessage(null);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-13-semibold text-white transition hover:bg-red-600"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adaugă alergie
        </button>
      </div>

      {message && (
        <div className={`mx-6 mt-4 rounded-lg px-4 py-3 text-13-regular ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="border-b border-dark-200 bg-gray-50 p-6">
          <h3 className="text-14-semibold text-dark-800 mb-4">
            {editingId ? "Editează alergia" : "Adaugă alergie nouă"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Tip alergen *</label>
              <select
                value={form.allergenType}
                onChange={(e) => setForm({ ...form, allergenType: e.target.value })}
                className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
              >
                {ALLERGEN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Nume alergen *</label>
              <input
                type="text"
                value={form.allergenName}
                onChange={(e) => setForm({ ...form, allergenName: e.target.value })}
                className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                placeholder="ex: Penicilină, Arahide..."
              />
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Tip reacție</label>
              <select
                value={form.reactionType}
                onChange={(e) => setForm({ ...form, reactionType: e.target.value })}
                className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
              >
                {REACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Severitate</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-12-regular text-dark-500">Simptome</label>
              <input
                type="text"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                placeholder="ex: Erupție cutanată, dificultăți respiratorii..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-12-regular text-dark-500">Note</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                placeholder="Informații suplimentare..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-lg border border-dark-200 px-4 py-2 text-13-semibold text-dark-600 hover:bg-gray-100"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-green-500 px-4 py-2 text-13-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? "Se salvează..." : editingId ? "Actualizează" : "Adaugă"}
            </button>
          </div>
        </div>
      )}

      {/* Active allergies list */}
      <div className="p-6">
        {activeAllergies.length === 0 && resolvedAllergies.length === 0 && (
          <p className="py-8 text-center text-14-regular text-dark-400">
            Nu sunt alergii înregistrate. Adaugă alergiile pentru siguranța ta medicală.
          </p>
        )}

        {activeAllergies.length > 0 && (
          <div className="space-y-3">
            {activeAllergies.map((allergy) => {
              const badge = getSeverityBadge(allergy.severity);
              return (
                <div
                  key={allergy.$id}
                  className="flex items-start justify-between rounded-lg border border-dark-200 p-4 transition hover:border-dark-300"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl">{getAllergenTypeIcon(allergy.allergenType)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-14-semibold text-dark-900">{allergy.allergenName}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-11-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-11-medium text-dark-500">
                          {getAllergenTypeLabel(allergy.allergenType)}
                        </span>
                      </div>
                      {allergy.symptoms && (
                        <p className="mt-1 text-13-regular text-dark-600">
                          Simptome: {allergy.symptoms}
                        </p>
                      )}
                      {allergy.notes && (
                        <p className="mt-0.5 text-12-regular text-dark-400 italic">
                          {allergy.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleResolve(allergy.$id)}
                      className="rounded-md p-1.5 text-dark-400 hover:bg-green-50 hover:text-green-600"
                      title="Marchează ca rezolvată"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(allergy)}
                      className="rounded-md p-1.5 text-dark-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Editează"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(allergy.$id)}
                      disabled={deletingId === allergy.$id}
                      className="rounded-md p-1.5 text-dark-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Șterge"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resolved */}
        {resolvedAllergies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-13-semibold text-dark-500 mb-2">
              Rezolvate / Istoric ({resolvedAllergies.length})
            </h3>
            <div className="space-y-2">
              {resolvedAllergies.map((allergy) => (
                <div
                  key={allergy.$id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 opacity-70"
                >
                  <div className="flex items-center gap-2">
                    <span>{getAllergenTypeIcon(allergy.allergenType)}</span>
                    <span className="text-14-regular text-dark-600 line-through">{allergy.allergenName}</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-11-medium text-green-700">Rezolvată</span>
                  </div>
                  <button
                    onClick={() => handleDelete(allergy.$id)}
                    disabled={deletingId === allergy.$id}
                    className="rounded-md p-1.5 text-dark-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
