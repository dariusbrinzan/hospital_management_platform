"use client";

import {
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { config } from "@/lib/config";
import { decryptKey } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const encryptedKey =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessKey")
      : null;

  useEffect(() => {
    const accessKey = encryptedKey && decryptKey(encryptedKey);
    const adminPasskey = process.env.NEXT_PUBLIC_ADMIN_PASSKEY || config.admin.passkey;

    if (accessKey !== adminPasskey.toString()) {
      router.replace("/");
    }
  }, [encryptedKey, router]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-100/80 dark:bg-slate-800/60">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-slate-100 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-28 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Nu există rezultate.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-9 rounded-lg border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow"
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-9 rounded-lg border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow "
            className="rotate-180"
          />
        </Button>
      </div>
    </div>
  );
}
