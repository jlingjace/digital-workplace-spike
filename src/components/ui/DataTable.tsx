"use client"

import * as React from "react"
import { cn } from "./utils"
import { LoadingSpinner } from "./LoadingSpinner"
import { EmptyState } from "./EmptyState"

export interface Column<T> {
  key: keyof T & string
  header: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage ?? "No data available"}
        description="There are no records to display."
      />
    )
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-mono text-label-sm font-medium text-on-surface-variant uppercase tracking-wide border-b border-border-subtle whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-border-subtle last:border-b-0 hover:bg-surface-container-low transition-colors duration-100"
            >
              {columns.map((col) => {
                const value = row[col.key]
                const isIdCol = col.key.startsWith("id")
                return (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-on-surface",
                      isIdCol
                        ? "font-mono text-label-sm"
                        : "text-body-sm"
                    )}
                  >
                    {col.render
                      ? col.render(value, row)
                      : value != null
                      ? String(value)
                      : "—"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
