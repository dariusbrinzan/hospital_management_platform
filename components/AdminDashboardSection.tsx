"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface AdminDashboardSectionProps {
  title: string;
  href: string;
  /** Emoji string (e.g. "🏠") or React node (e.g. Lucide icon) */
  icon?: React.ReactNode | string;
  children: React.ReactNode;
}

export function AdminDashboardSection({ title, href, icon, children }: AdminDashboardSectionProps) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm transition hover:shadow-md dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 py-4 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          {icon && (typeof icon === "string" ? <span className="flex size-6 items-center justify-center text-base leading-none" aria-hidden>{icon}</span> : <span className="flex shrink-0 items-center text-slate-600 dark:text-slate-400">{icon}</span>)}
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
        >
          Vezi tot
          <ChevronRight className="size-4" />
        </Link>
      </CardHeader>
      <CardContent className="pt-4 text-sm text-slate-600 dark:text-slate-400">
        {children}
      </CardContent>
    </Card>
  );
}
