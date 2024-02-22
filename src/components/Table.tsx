import { metadata } from '@/app/attendance/page';
import { useState } from 'react';
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
      <table className="w-full table-auto">
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
          {tableData.map((dataRow: any, dataKey: any) => (
            <tr key={dataKey} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              {columns.map((colRow: any) => (
                <td
                  key={colRow.index}
                  className="border-b border-[#eee] px-3 py-3 dark:border-strokedark xl:pl-10"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: colRow.render(dataRow[colRow.index]),
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
    </div>
  );
};

export default Table;
