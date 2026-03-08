"use client";

import { useState, useEffect } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientSignModal, type DocumentTypeForSign } from "@/components/PatientSignModal";
import { formatDateTime } from "@/lib/utils";

const DOCUMENT_LABELS: Record<string, string> = {
  consent_gdpr: "Consimțământ GDPR",
  document_receipt: "Primire document",
  general: "General",
};

export function PatientSignatureCard() {
  const [signatures, setSignatures] = useState<{ $id: string; documentType: string; signedAt: Date | string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<DocumentTypeForSign>("general");

  const loadSignatures = () => {
    fetch("/api/patient/signature")
      .then((r) => r.json())
      .then((data) => {
        setSignatures(data.signatures ?? []);
      })
      .catch(() => setSignatures([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const openSign = (type: DocumentTypeForSign) => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
            <PenLine className="size-5 text-teal-600 dark:text-teal-400" />
            Semnătură digitală
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Semnați digital consimțământul sau confirmarea primirii documentelor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/50"
              onClick={() => openSign("consent_gdpr")}
            >
              Consimțământ GDPR
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/50"
              onClick={() => openSign("document_receipt")}
            >
              Confirmare primire document
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/50"
              onClick={() => openSign("general")}
            >
              Semnătură generală
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Se încarcă...</p>
          ) : signatures.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Semnături recente
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                {signatures.slice(0, 5).map((s) => (
                  <li key={s.$id} className="flex items-center justify-between gap-2">
                    <span>{DOCUMENT_LABELS[s.documentType] ?? s.documentType}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDateTime(typeof s.signedAt === "string" ? s.signedAt : (s.signedAt as Date).toISOString()).dateTime}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <PatientSignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadSignatures}
        documentType={modalType}
        documentId={null}
      />
    </>
  );
}
