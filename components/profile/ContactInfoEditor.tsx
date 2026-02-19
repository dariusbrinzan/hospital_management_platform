"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContactInfo } from "@/lib/actions/profile.actions";

interface Props {
  patientId: string;
  patient: {
    phone?: string;
    email?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
  };
}

export function ContactInfoEditor({ patientId, patient }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    phone: patient.phone || "",
    email: patient.email || "",
    address: patient.address || "",
    emergencyContactName: patient.emergencyContactName || "",
    emergencyContactNumber: patient.emergencyContactNumber || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateContactInfo(patientId, form);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Date de contact actualizate!" });
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
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50">
            <svg className="size-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
            </svg>
          </div>
          <h2 className="text-18-bold text-dark-900">Date de Contact</h2>
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

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { key: "phone", label: "Telefon", type: "tel", placeholder: "+40 7xx xxx xxx" },
            { key: "email", label: "Email", type: "email", placeholder: "email@exemplu.ro" },
            { key: "address", label: "Adresă", type: "text", placeholder: "Str. Exemplu, Nr. 1, București" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className={key === "address" ? "md:col-span-2" : ""}>
              <label className="mb-1 block text-12-regular text-dark-500">{label}</label>
              {isEditing ? (
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder={placeholder}
                />
              ) : (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-14-medium text-dark-800">
                  {(form as any)[key] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h3 className="text-14-semibold text-dark-700 mb-3 flex items-center gap-2">
            <svg className="size-4 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Contact de Urgență
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Nume</label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.emergencyContactName}
                  onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 bg-white px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder="Nume contact urgență"
                />
              ) : (
                <p className="rounded-lg bg-white px-3 py-2 text-14-medium text-dark-800">
                  {form.emergencyContactName || "—"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-12-regular text-dark-500">Telefon</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.emergencyContactNumber}
                  onChange={(e) => setForm({ ...form, emergencyContactNumber: e.target.value })}
                  className="w-full rounded-lg border border-dark-200 bg-white px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
                  placeholder="+40 7xx xxx xxx"
                />
              ) : (
                <p className="rounded-lg bg-white px-3 py-2 text-14-medium text-dark-800">
                  {form.emergencyContactNumber || "—"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
