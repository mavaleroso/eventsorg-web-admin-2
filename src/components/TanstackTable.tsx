import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";



type tableProps = {
  columns: any;
  data: any;
};

const TanstackTable = ({ columns, data }: tableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="fill-gray-400 max-w-5xl p-2">
      <table className="border-gray-700 w-full border text-left">
        <thead className="bg-indigo-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3.5 py-2 capitalize text-white"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length
            ? table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${i % 2 === 0 ? "bg-slate-900" : "bg-slate-800"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3.5 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
      {/* pagination */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
          className="border border-slate-300 p-1 px-2 disabled:opacity-30"
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
          className="border border-slate-300 p-1 px-2 disabled:opacity-30"
        >
          {">"}
        </button>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>

        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 rounded border bg-transparent p-1"
          />
        </span>
        Show
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="bg-transparent p-2"
        >
          {[10, 20, 30, 50].map((ps) => (
            <option key={ps} value={ps}>
              {ps}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TanstackTable;
