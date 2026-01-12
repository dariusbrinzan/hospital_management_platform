import clsx from "clsx";
import Image from "next/image";

type StatCardProps = {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
};

export const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div
      className={clsx("stat-card", {
        "bg-green-500": type === "appointments", // Verde pentru confirmate
        "bg-blue-500": type === "pending", // Albastru pentru în așteptare
        "bg-red-600": type === "cancelled", // Roșu (nu strident) pentru anulate
      })}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          height={32}
          width={32}
          alt="appointments"
          className="size-8 w-fit brightness-0 invert"
        />
        <h2 className="text-32-bold text-white">{count}</h2>
      </div>

      <p className="text-14-regular text-white">{label}</p>
    </div>
  );
};
