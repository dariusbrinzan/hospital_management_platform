"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitProblemReport } from "@/lib/actions/report.actions";

type Props = { userId: string };

export function ReportProblemForm({ userId }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await submitProblemReport({ subject, description });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setSubject("");
    setDescription("");
    setTimeout(() => router.push(`/patients/${userId}/dashboard`), 2000);
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-16-medium text-green-800">Raport trimis cu succes.</p>
        <p className="text-14-regular text-green-700 mt-2">
          Administratorul va verifica raportul. Vei fi redirecționat la dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-dark-200 bg-white p-6">
      <div>
        <label htmlFor="subject" className="text-14-medium text-dark-700 block mb-2">
          Subiect
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Eroare la încărcarea programărilor"
          maxLength={200}
          required
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="description" className="text-14-medium text-dark-700 block mb-2">
          Descriere
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrie problema întâmpinată..."
          rows={5}
          required
          className="w-full resize-y"
        />
      </div>
      {error && <p className="text-14-regular text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="shad-primary-btn w-full sm:w-auto">
        {loading ? "Se trimite…" : "Trimite raportul"}
      </Button>
    </form>
  );
}
