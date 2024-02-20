"use client";

import Calendar from "@/components/Calender";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useReducer, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  Column,
  Table,
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  OnChangeFn,
  flexRender,
} from "@tanstack/react-table";

import { makeData, Person } from "./makeData";

// export const metadata: Metadata = {
//   title: "Events Org | Users",
// };

const UsersPage = () => {
  const rerender = useReducer(() => ({}), {})[1];

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        header: "Name",
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: "firstName",
            cell: (info) => info.getValue(),
            footer: (props) => props.column.id,
          },
          {
            accessorFn: (row) => row.lastName,
            id: "lastName",
            cell: (info) => info.getValue(),
            header: () => <span>Last Name</span>,
            footer: (props) => props.column.id,
          },
        ],
      },
      {
        header: "Info",
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: "age",
            header: () => "Age",
            footer: (props) => props.column.id,
          },
          {
            header: "More Info",
            columns: [
              {
                accessorKey: "visits",
                header: () => <span>Visits</span>,
                footer: (props) => props.column.id,
              },
              {
                accessorKey: "status",
                header: "Status",
                footer: (props) => props.column.id,
              },
              {
                accessorKey: "progress",
                header: "Profile Progress",
                footer: (props) => props.column.id,
              },
            ],
          },
        ],
      },
    ],
    [],
  );

  const [data, setData] = useState(() => makeData(100000));
  const refreshData = () => setData(() => makeData(100000));

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Users" />

        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          {/* <Table
            {...{
              data,
              columns,
            }}
          />
          <hr />
          <div>
            <button onClick={() => rerender()}>Force Rerender</button>
          </div>
          <div>
            <button onClick={() => refreshData()}>Refresh Data</button>
          </div> */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UsersPage;
