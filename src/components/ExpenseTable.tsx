import {
  Column,
  ColumnDef,
  PaginationState,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@tremor/react";
import { format } from "date-fns";
import { Transaction } from "expensasaures/shared/types/transaction";
import { capitalize } from "expensasaures/shared/utils/common";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { FiExternalLink } from "react-icons/fi";

interface Props {
  data: Transaction[];
  fetchDataOptions: PaginationState;
  pageCount: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>
}

const ExpenseTable = (props: Props) => {
  const { data, fetchDataOptions, pageCount, setPagination } = props;
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        accessorFn: (row) => capitalize(row.$id),
        header: () => "Link",
        cell: (info) => <Link target="_blank" href={`/expenses/${info.getValue()}`}>
          <FiExternalLink />
        </Link>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "title",
        accessorFn: (row) => row.title,
        header: () => "Title",
        id: "title",
        cell: (info) => {
          const title = info.getValue() as string;
          return <p>{title.length > 60 ? `${title.slice(0, 60)}...` : title}</p>;
        },
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "category",
        accessorFn: (row) => capitalize(row.category),
        header: () => "Category",
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.date,
        id: "startingDate",
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return format(date, "dd-MM-yyyy");
        },
        header: () => "Date",
        footer: (props) => props.column.id,
      },
      // {
      //   accessorKey: "endDate",
      //   header: () => <span>Ending Date</span>,
      //   cell: (info) => {
      //     const date = new Date(info.getValue() as string);
      //     return format(date, "dd-MM-yyyy");
      //   },
      //   footer: (props) => props.column.id,
      // },

      {
        accessorKey: "amount",
        header: () => <span>Total</span>,
        footer: (props) => props.column.id,
      },
      // { show in :id page
      //   accessorKey: "status",
      //   header: "Status",
      //   footer: (props) => props.column.id,
      // },
      // {
      //   accessorKey: "progress",
      //   header: "Profile Progress",
      //   footer: (props) => props.column.id,
      // },
    ],
    []
  );

  return (
    <>
      <Table setPagination={setPagination} pageCount={pageCount} fetchDataOptions={fetchDataOptions} data={data} columns={columns} />

    </>
  );
}

function Table({
  data,
  columns,
  fetchDataOptions,
  pageCount,
  setPagination
}: {
  data: Transaction[];
  columns: ColumnDef<Transaction>[];
  fetchDataOptions: PaginationState,
  pageCount: number,
  setPagination: Dispatch<SetStateAction<PaginationState>>
}) {
  const { pageIndex, pageSize } = fetchDataOptions;
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

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
    <div className="p-2 flex flex-col flex-1">

      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className=''>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    className="min-w-[100px] pl-4 first:pl-0 font-semibold text-slate-700"
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="text-left mb-3">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() ? (
                          <div>
                            {/* <Filter column={header.column} table={table} /> */}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr className="border-b" key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td className="min-w-[100px] pl-4 first:pl-0 h-[50px] text-slate-700" key={cell.id}>
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
      <hr className="my-4 mt-auto" />
      <div className="flex items-center justify-between gap-2">

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <div className="flex items-center gap-2">
          <Button
            className="border px-3 rounded"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            className="border rounded px-3"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            className="border rounded px-3"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            className="border rounded px-3"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-10"
            />
          </span>
          {/* <SelectBox
            onValueChange={(value) =>
              table.setPageSize(Number(value))
            }
            className="min-w-[100px] w-8"
            value={table.getState().pagination.pageSize.toString()}
          >
            {['10', '20', '30', '40', '50'].map((size, index) => {
              return (
                <SelectBoxItem
                  key={size}
                  value={size}
                  text={size}

                />
              );
            })}
          </SelectBox> */}
        </div>
      </div>

    </div>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  );
}

export default ExpenseTable;
