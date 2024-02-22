import Loader from './common/Loader';

type tableProps = {
  columns: any;
  tableData: any;
  metaData: any;
  loading: boolean;
  tableFn: (params: object) => void;
};

const Table = ({ columns, tableData, metaData, loading, tableFn }: tableProps) => {
  const handleChange = (limit: number, page: number) => {
    tableFn({ limit: limit, page: page });
  };
  return (
    <div>
      <table className="w-full table-auto rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-2 text-center dark:bg-meta-4">
            {columns.map((columnHeader: any) => (
              <th
                key={columnHeader.index}
                className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white"
              >
                {columnHeader.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length}>
                <Loader />
              </td>
            </tr>
          )}
          {tableData.length > 0
            ? tableData.map((dataRow: any, dataKey: any) => (
                <tr key={dataKey} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  {columns.map((colRow: any) => (
                    <td
                      key={colRow.index}
                      className="border-b border-[#eee] px-3 py-3 dark:border-strokedark xl:pl-10"
                    >
                      {colRow.render(dataRow[colRow.index], dataRow)}
                    </td>
                  ))}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="my-30">
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-25 h-25 drop-shadow-lg opacity-50"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-center text-sm font-semibold">No Data</h2>
                    </div>
                  </td>
                </tr>
              )}
        </tbody>
      </table>
      {tableData.length > 0 && (
        <div className="flex items-center justify-end gap-2 p-4">
          <span>
            {metaData?.from} - {metaData?.to} of {metaData?.total} items
          </span>
          <span className="flex items-center gap-1">
            {metaData?.links.map((l: any, i: any) => (
              <button
                key={i}
                onClick={() => {
                  if (l.label.includes('Previous')) {
                    handleChange(metaData.per_page, metaData.current_page - 1);
                    return;
                  } else if (l.label.includes('Next')) {
                    handleChange(metaData.per_page, metaData.current_page + 1);
                    return;
                  } else {
                    handleChange(metaData.per_page, Number(l.label));
                  }
                }}
                disabled={!l.url}
                className={`${l.active ? 'flex-grow min-w-9 p-2 border border-primary hover:bg-slate-50 rounded text-sm' : 'flex-grow min-w-9 p-2  hover:bg-slate-50 rounded text-sm'}`}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: l.label,
                  }}
                />
              </button>
            ))}
          </span>
          <span>
            <select
              className="text-sm w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={(e) => {
                handleChange(Number(e.target.value), 1);
              }}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </span>
        </div>
      )}
    </div>
  );
};

export default Table;
