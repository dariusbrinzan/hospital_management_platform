import Image from "next/image";
import Link from "next/link";

type AdminPageLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  children: React.ReactNode;
};

export function AdminPageLayout({ title, description, backHref = "/admin", children }: AdminPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 pt-6 sm:px-6 lg:gap-10 lg:px-8">
      <header className="admin-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link href="/admin" className="shrink-0" aria-label="Dashboard">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={200}
              alt="eHealth.ro"
              className="h-8 w-auto"
            />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">{title}</h1>
            {description && (
              <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        <Link
          href={backHref}
          className="rounded-md text-sm font-medium text-teal-600 hover:text-teal-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-teal-400 dark:hover:text-teal-300"
        >
          ← Înapoi la Dashboard
        </Link>
      </header>

      <main className="flex flex-col gap-8 lg:gap-10">{children}</main>
    </div>
  );
}
