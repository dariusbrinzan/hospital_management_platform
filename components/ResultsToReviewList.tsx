"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, FileSignature, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  status?: string;
  patientId?: string;
};

export function ResultsToReviewList({
  type,
  items,
}: {
  type: "lab" | "imaging";
  items: Item[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "seen" | "signed" } | null>(null);
  const [note, setNote] = useState("");

  const baseUrl = type === "lab" ? "/api/doctor/results/lab" : "/api/doctor/results/imaging";

  const mark = async (id: string, noteForPatient: string | null) => {
    setLoadingId(id);
    try {
      const res = await fetch(`${baseUrl}/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteForPatient }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Eroare");
      }
      toast.success("Marcat cu succes.");
      router.refresh();
      setNoteModal(null);
      setNote("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eroare la marcare.");
    } finally {
      setLoadingId(null);
    }
  };

  const openNote = (id: string, action: "seen" | "signed") => {
    setNoteModal({ id, action });
    setNote("");
  };

  const submitNote = () => {
    if (!noteModal) return;
    mark(noteModal.id, note.trim() || null);
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{item.subtitle}</p>
            {item.detail && item.detail !== "—" && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {item.patientId && (
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link href={`/doctor/patients/${item.patientId}`}>
                  <UserRound className="size-4 mr-1" />
                  Dosar
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-300 dark:border-slate-600"
              disabled={loadingId === item.id}
              onClick={() => mark(item.id, null)}
            >
              <Check className="size-4 mr-1" />
              Văzut
            </Button>
            <Button
              size="sm"
              className="rounded-lg bg-teal-600 hover:bg-teal-700"
              disabled={loadingId === item.id}
              onClick={() => openNote(item.id, "signed")}
            >
              <FileSignature className="size-4 mr-1" />
              Semnat
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={!!noteModal} onOpenChange={(open) => !open && setNoteModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notă pentru pacient (opțional)</DialogTitle>
            <DialogDescription>
              Poți adăuga o scurtă notă care va fi asociată rezultatului semnat (ex. „Rezultate în limite. Repetare peste 3 luni.”).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Notă</Label>
            <Textarea
              id="note"
              placeholder="Ex: Rezultate în limite. Repetare analiză peste 6 luni."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal(null)}>
              Anulare
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={submitNote}
              disabled={loadingId !== null}
            >
              {loadingId ? "Se salvează..." : "Marchează semnat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
