import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import Button from "expensasaurus/components/ui/Button";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { capitalize } from "expensasaurus/shared/utils/common";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { FiExternalLink } from "react-icons/fi";

interface Props {
  data: Transaction[];
  fetchDataOptions: PaginationState;
  pageCount: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  type: "expense" | "income";
}

const ExpenseTable = (props: Props) => {
  const { data, fetchDataOptions, pageCount, setPagination, type } = props;
  const isExpense = type === "expense";
  // const isIncome = type === 'income'
  // const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        accessorFn: (row) => capitalize(row.$id),
        header: () => "Link",
        cell: (info) => (
          <Link
            target="_blank"
            href={
              isExpense
                ? `/expenses/${info.getValue()}`
                : `/incomes/${info.getValue()}`
            }
          >
            <FiExternalLink className="h-4 w-4 text-slate-400 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100" />
          </Link>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "title",
        accessorFn: (row) => row.title,
        header: () => "Title",
        id: "title",
        cell: (info) => {
          const title = info.getValue() as string;
          return (
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {title.length > 60 ? `${title.slice(0, 60)}...` : title}
            </p>
          );
        },
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "category",
        accessorFn: (row) => capitalize(row.category),
        header: () => "Category",
        cell: (info) => (
          <span className="text-slate-600 dark:text-slate-300">
            {info.getValue() as string}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.date,
        id: "startingDate",
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return (
            <span className="text-slate-500 dark:text-slate-300">
              {format(date, "dd MMM yyyy")}
            </span>
          );
        },
        header: () => "Date",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "amount",
        header: () => <span>Total</span>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(row.currency || "INR", Number(row.amount || 0))}
            </span>
          );
        },
        footer: (props) => props.column.id,
      },
    ],
    [isExpense]
  );

  return (
    <>
      <Table
        setPagination={setPagination}
        pageCount={pageCount}
        fetchDataOptions={fetchDataOptions}
        data={data}
        columns={columns}
      />
    </>
  );
};

function Table({
  data,
  columns,
  fetchDataOptions,
  pageCount,
  setPagination,
}: {
  data: Transaction[];
  columns: ColumnDef<Transaction>[];
  fetchDataOptions: PaginationState;
  pageCount: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
}) {
  const { pageIndex, pageSize } = fetchDataOptions;
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: () => false },
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: pageCount ?? -1,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //
    debugTable: true,
  });

  return (
    <div className="flex flex-col flex-1">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isAmountHeader = header.column.id === "amount";
                    const isLinkHeader = header.column.id === "id";
                    return (
                      <th
                        className={`px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 ${
                          isAmountHeader
                            ? "text-left"
                            : isLinkHeader
                            ? "text-center"
                            : "text-left"
                        }`}
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr
                    className="transition hover:bg-slate-50/60 dark:hover:bg-white/5"
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isAmountCell = cell.column.id === "amount";
                      const isLinkCell = cell.column.id === "id";
                      return (
                        <td
                          className={`px-6 py-4 text-slate-700 dark:text-slate-300 ${
                            isAmountCell
                              ? "text-left"
                              : isLinkCell
                              ? "text-center"
                              : ""
                          }`}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full px-4"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full px-4"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs">
          Jump to
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-700 outline-none transition focus:border-slate-400 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-white/35"
          />
        </label>
      </div>
    </div>
  );
}

export default ExpenseTable;
