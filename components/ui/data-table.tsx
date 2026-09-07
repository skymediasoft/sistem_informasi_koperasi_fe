"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  accessor?: (row: T, index: number) => React.ReactNode;
};

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  createLabel?: string;
  emptyMessage?: string;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  title,
  subtitle,
  data,
  columns,
  pageSize = 5,
  searchPlaceholder = "Cari data...",
  createLabel = "Create New Data",
  emptyMessage = "Belum ada data.",
  onCreate,
  onEdit,
  onDelete,
  renderActions,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredData = React.useMemo(() => {
    if (!query.trim()) return data;

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [data, query]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const paginatedData = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageSize, safePage]);

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 px-5 py-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9"
            />
          </div>
    
          {onCreate ? (
            <Button onClick={onCreate} className="h-9 gap-2">
              <Plus className="size-4" />
              {createLabel}
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-emerald-700 text-left text-emerald-50 shadow-sm">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "sticky top-0 z-20 border-b border-emerald-600 bg-emerald-700 px-4 py-3 font-semibold text-emerald-50 shadow-sm",
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {(onEdit || onDelete || renderActions) && (
                  <th className="sticky top-0 z-20 border-b border-emerald-600 bg-emerald-700 px-4 py-3 text-right font-semibold text-emerald-50 shadow-sm">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete || renderActions ? 1 : 0)}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const displayIndex = (safePage - 1) * pageSize + rowIndex + 1;
                  const isEvenRow = rowIndex % 2 === 0;

                  return (
                    <tr
                      key={rowIndex}
                      className={cn(
                        "border-b border-border/70 align-middle transition-colors",
                        isEvenRow ? "bg-muted/15" : "bg-background"
                      )}
                    >
                      {columns.map((column) => {
                        const value = (row as Record<string, unknown>)[String(column.key)];

                        return (
                          <td
                            key={`${rowIndex}-${column.key}`}
                            className={cn("px-4 py-3 text-foreground", column.className)}
                          >
                            {column.accessor ? column.accessor(row, displayIndex) : (value as React.ReactNode) ?? "-"}
                          </td>
                        );
                      })}

                      {(onEdit || onDelete || renderActions) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {renderActions ? (
                              renderActions(row)
                            ) : (
                              <>
                                {onEdit ? (
                                  <Button variant="outline" size="sm" onClick={() => onEdit(row)} className="h-8 gap-1.5">
                                    <Pencil className="size-3.5" />
                                    Edit
                                  </Button>
                                ) : null}
                                {onDelete ? (
                                  <Button variant="destructive" size="sm" onClick={() => onDelete(row)} className="h-8 gap-1.5">
                                    <Trash2 className="size-3.5" />
                                    Delete
                                  </Button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredData.length)} of {filteredData.length}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="h-8 gap-1.5"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>

            <div className="flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{safePage}</span>
              <span>/</span>
              <span>{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="h-8 gap-1.5"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
