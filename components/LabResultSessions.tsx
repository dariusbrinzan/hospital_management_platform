"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  User,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LabResult {
  $id: string;
  testName: string;
  testCategory?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  status?: string;
  notes?: string;
  performedDate?: string;
}

interface Session {
  id: string;
  doctorName: string;
  visitDate: string;
  reason?: string;
  items: LabResult[];
}

function getStatusColor(status?: string) {
  switch (status) {
    case "normal":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "abnormal":
    case "high":
    case "low":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    case "critical":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "normal":
      return "Normal";
    case "abnormal":
      return "Anormal";
    case "high":
      return "Crescut";
    case "low":
      return "Scăzut";
    case "critical":
      return "Critic";
    case "pending":
      return "În așteptare";
    default:
      return status || "—";
  }
}

export function LabResultSessions({ sessions }: { sessions: Session[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {sessions.map((s) => {
        const isOpen = expandedId === s.id;
        const categories = [
          ...new Set(s.items.map((i) => i.testCategory).filter(Boolean)),
        ];

        return (
          <Card
            key={s.id}
            className="border-slate-200/80 shadow-sm transition dark:border-slate-800"
          >
            <button
              type="button"
              onClick={() => toggle(s.id)}
              className="w-full text-left"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                      <FlaskConical className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                        Set analize — {formatDateTime(s.visitDate).dateOnly}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <User className="size-3.5" />
                          {s.doctorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {formatDateTime(s.visitDate).dateTime}
                        </span>
                        {s.reason && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Motiv: {s.reason}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      {s.items.length}{" "}
                      {s.items.length === 1 ? "analiză" : "analize"}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="size-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="size-5 text-slate-400" />
                    )}
                  </div>
                </div>
                {!isOpen && categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-[52px]">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>
            </button>

            {isOpen && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {categories.length > 0
                    ? categories.map((cat) => {
                        const catItems = s.items.filter(
                          (i) => i.testCategory === cat
                        );
                        return (
                          <div key={cat}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {cat}
                            </p>
                            <div className="space-y-2">
                              {catItems.map((lr) => (
                                <LabResultRow key={lr.$id} lr={lr} />
                              ))}
                            </div>
                          </div>
                        );
                      })
                    : s.items.map((lr) => (
                        <LabResultRow key={lr.$id} lr={lr} />
                      ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function LabResultRow({ lr }: { lr: LabResult }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {lr.testName}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
            lr.status
          )}`}
        >
          {getStatusLabel(lr.status)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Rezultat
          </span>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {lr.resultValue ?? "—"} {lr.unit || ""}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Referință
          </span>
          <p className="text-slate-700 dark:text-slate-300">
            {lr.referenceRange || "—"}
          </p>
        </div>
        {lr.performedDate && (
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Data
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              {formatDateTime(lr.performedDate).dateOnly}
            </p>
          </div>
        )}
      </div>
      {lr.notes && (
        <div className="mt-2 rounded-md bg-slate-50 p-2 dark:bg-slate-800/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Observații
          </p>
          <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
            {lr.notes}
          </p>
        </div>
      )}
    </div>
  );
}
