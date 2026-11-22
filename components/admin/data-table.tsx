import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center border border-dashed border-taupe/30 bg-white/60 p-12 text-sm text-taupe">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-taupe/15 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-taupe/15 text-xs uppercase tracking-label text-taupe">
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 font-medium ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-taupe/10 last:border-0 hover:bg-ivory/50">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
