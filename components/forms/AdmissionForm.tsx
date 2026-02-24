"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DEPARTMENTS = [
  { value: "cardiology", label: "Cardiologie" },
  { value: "surgery", label: "Chirurgie" },
  { value: "pediatrics", label: "Pediatrie" },
  { value: "orthopedics", label: "Ortopedie" },
  { value: "neurology", label: "Neurologie" },
  { value: "general", label: "General" },
];

const ROOM_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "private", label: "Privat" },
  { value: "semi_private", label: "Semi-privat" },
  { value: "isolation", label: "Izolare" },
];

const ADMISSION_TYPES = [
  { value: "elective", label: "Programată" },
  { value: "urgent", label: "Urgentă" },
  { value: "emergency", label: "De urgență" },
  { value: "transfer", label: "Transfer" },
];

interface AdmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AdmissionForm = ({ onSuccess, onCancel }: AdmissionFormProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "",
    department: "general",
    roomType: "",
    admissionReason: "",
    diagnosis: "",
    admittingDoctor: "",
    assignedDoctor: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    expectedLengthOfStay: "",
    notes: "",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setForm({
      ...form,
      patientId: patient.$id,
      patientName: patient.name,
      patientPhone: patient.phone || "",
      patientAge: patient.birthDate
        ? String(new Date().getFullYear() - new Date(patient.birthDate).getFullYear())
        : "",
      patientGender: patient.gender || "",
      insuranceProvider: patient.insuranceProvider || "",
      insurancePolicyNumber: patient.insurancePolicyNumber || "",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/hospital/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId || null,
          patientName: form.patientName,
          patientPhone: form.patientPhone || undefined,
          patientAge: form.patientAge || undefined,
          patientGender: form.patientGender || undefined,
          department: form.department,
          roomType: form.roomType || undefined,
          admissionReason: form.admissionReason,
          diagnosis: form.diagnosis || undefined,
          admittingDoctor: form.admittingDoctor,
          assignedDoctor: form.assignedDoctor || undefined,
          insuranceProvider: form.insuranceProvider || undefined,
          insurancePolicyNumber: form.insurancePolicyNumber || undefined,
          expectedLengthOfStay: form.expectedLengthOfStay ? Number(form.expectedLengthOfStay) : undefined,
          notes: form.notes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pacientul a fost internat cu succes!");
        if (onSuccess) onSuccess();
        else router.refresh();
      } else {
        setError(data.error || "Eroare la internare");
      }
    } catch (error: any) {
      setError(error.message || "Eroare la internare");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Căutare pacient */}
      <div>
        <label className="block text-14-semibold text-dark-700 mb-2">
          Caută pacient existent (opțional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Nume, email, telefon sau CNP"
            className="flex-1 rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-dark-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Caută..." : "Caută"}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border border-dark-200 rounded-lg max-h-48 overflow-y-auto">
            {searchResults.map((patient) => (
              <button
                key={patient.$id}
                type="button"
                onClick={() => handleSelectPatient(patient)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-dark-100 last:border-b-0"
              >
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-dark-500">
                  {patient.email} • {patient.phone}
                </p>
              </button>
            ))}
          </div>
        )}
        {selectedPatient && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-14-semibold text-green-800">
              Pacient selectat: {selectedPatient.name}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedPatient(null);
                setForm({ ...form, patientId: "" });
              }}
              className="text-12-regular text-green-600 hover:underline mt-1"
            >
              Șterge selecția
            </button>
          </div>
        )}
      </div>

      {/* Informații pacient */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">
            Nume pacient *
          </label>
          <input
            type="text"
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            required
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Telefon</label>
          <input
            type="tel"
            value={form.patientPhone}
            onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Vârstă</label>
          <input
            type="number"
            value={form.patientAge}
            onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Gen</label>
          <select
            value={form.patientGender}
            onChange={(e) => setForm({ ...form, patientGender: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          >
            <option value="">Selectează</option>
            <option value="Bărbat">Bărbat</option>
            <option value="Femeie">Femeie</option>
          </select>
        </div>
      </div>

      {/* Informații internare */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">
            Secție *
          </label>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Tip cameră</label>
          <select
            value={form.roomType}
            onChange={(e) => setForm({ ...form, roomType: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          >
            <option value="">Orice tip</option>
            {ROOM_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">
            Medic internare *
          </label>
          <input
            type="text"
            value={form.admittingDoctor}
            onChange={(e) => setForm({ ...form, admittingDoctor: e.target.value })}
            required
            placeholder="Numele medicului"
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Medic responsabil</label>
          <input
            type="text"
            value={form.assignedDoctor}
            onChange={(e) => setForm({ ...form, assignedDoctor: e.target.value })}
            placeholder="Numele medicului"
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-14-semibold text-dark-700 mb-1">
          Motiv internare *
        </label>
        <textarea
          value={form.admissionReason}
          onChange={(e) => setForm({ ...form, admissionReason: e.target.value })}
          required
          rows={3}
          className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Diagnostic</label>
          <input
            type="text"
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Durată estimată (zile)</label>
          <input
            type="number"
            value={form.expectedLengthOfStay}
            onChange={(e) => setForm({ ...form, expectedLengthOfStay: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Asigurare</label>
          <input
            type="text"
            value={form.insuranceProvider}
            onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-14-semibold text-dark-700 mb-1">Nr. poliță</label>
          <input
            type="text"
            value={form.insurancePolicyNumber}
            onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })}
            className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-14-semibold text-dark-700 mb-1">Note</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular focus:border-green-500 focus:outline-none resize-none"
        />
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-dark-200 rounded-lg text-14-semibold text-dark-700 hover:bg-gray-50"
          >
            Anulează
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-14-semibold hover:bg-green-600 disabled:opacity-50"
        >
          {submitting ? "Se internă..." : "Internare pacient"}
        </button>
      </div>
    </form>
  );
};
