import Link from "next/link";

interface AdminDashboardSectionProps {
  title: string;
  href: string;
  icon?: string;
  children: React.ReactNode;
}

export function AdminDashboardSection({ title, href, icon, children }: AdminDashboardSectionProps) {
  return (
    <section className="admin-section-card rounded-xl border border-dark-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-dark-100 pb-3">
        <h2 className="text-16-semibold text-dark-900 flex items-center gap-2">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h2>
        <Link
          href={href}
          className="text-14-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Vezi tot →
        </Link>
      </div>
      <div className="pt-3 text-14-regular text-dark-600">{children}</div>
    </section>
  );
}
