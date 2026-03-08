"use client";

import { useRef, useState } from "react";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type DocumentTypeForSign = "consent_gdpr" | "document_receipt" | "general";

const DOCUMENT_LABELS: Record<DocumentTypeForSign, string> = {
  consent_gdpr: "Consimțământ prelucrare date (GDPR)",
  document_receipt: "Confirmare primire document",
  general: "Semnătură generală",
};

interface PatientSignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documentType: DocumentTypeForSign;
  documentId?: string | null;
  title?: string;
  description?: string;
}

export function PatientSignModal({
  open,
  onClose,
  onSuccess,
  documentType,
  documentId = null,
  title,
  description,
}: PatientSignModalProps) {
  const signatureRef = useRef<SignaturePadHandle>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const pad = signatureRef.current;
    if (!pad?.hasSignature()) {
      toast.error("Desenați semnătura în casetă.");
      return;
    }
    const dataUrl = pad.getDataURL();
    if (!dataUrl) {
      toast.error("Semnătura nu a putut fi citită. Încercați din nou.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/patient/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          documentId,
          signatureData: dataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");
      toast.success("Semnătura a fost salvată.");
      pad.clear();
      onClose();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.message || "Eroare la salvarea semnăturii.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    signatureRef.current?.clear();
    onClose();
  };

  if (!open) return null;

  const label = title ?? DOCUMENT_LABELS[documentType];
  const desc =
    description ??
    "Semnați în caseta de mai jos folosind mouse-ul sau degetul pe ecrane tactile.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>

        <div className="mt-4">
          <SignaturePad
            ref={signatureRef}
            width={400}
            height={160}
            className="w-full"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700"
            onClick={handleClose}
            disabled={loading}
          >
            Anulare
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Se salvează..." : "Semnează"}
          </Button>
        </div>
      </div>
    </div>
  );
}
