'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { getAttendance } from '@/services/attendance/api';

const AttendancePage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [formFilterData, setFormFilterData] = useState({
    limit: 10,
    page: 1,
  });

  const columns = [
    {
      title: 'Name',
      index: 'name',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Stats',
      index: 'status',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">${dom || '-'}</h5>;
      },
    },
    {
      title: 'Nickname',
      index: 'nickname',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">${dom || '-'}</h5>;
      },
    },
    {
      title: 'Arrived',
      index: 'arrived',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">${dom || '-'}</h5>;
      },
    },
  ];

  useEffect(() => {
    handleGetAttendance(formFilterData);
  }, []);

  const handleGetAttendance = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getAttendance([], params);

      setTableData(res?.data.data);
      setTableMetaData(res?.data.meta);

      setFormFilterData({
        ...formFilterData,
        ['limit']: res?.data.meta.per_page,
        ['page']: res?.data.meta.current_page,
      });
    } catch (error) {
      console.log('error: ', error);
      // if (error?.response?.status == 401) {
      // let res = await  outLogin()
      // message.error('UnAuthenticated.')
      // store.remove('accessToken');
      // history.push('/')

      // }
    }
    setLoading(false);
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Attendance" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <select
              name=""
              id=""
              className="border border-slate-400 rounded-lg w-full px-4 py-2 my-3"
            ></select>
            <Table
              columns={columns}
              tableData={tableData}
              metaData={tableMetaData}
              tableFn={handleGetAttendance}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AttendancePage;
