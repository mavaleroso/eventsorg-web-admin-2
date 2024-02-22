'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { getAttendance } from '@/services/attendance/api';
import moment from 'moment';
import { getEvents } from '@/services/events/api';
// @ts-ignore
import store from 'store';
import { useRouter } from 'next/navigation';

const AttendancePage = () => {
  const router = useRouter();
  const token = store.get('accessToken');
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [formFilterData, setFormFilterData] = useState({
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (!token) {
      router.push('/user/login');
    }
  }, []);

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
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Nickname',
      index: 'nickname',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Arrived',
      index: 'checkin_time',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
  ];

  useEffect(() => {
    // handleGetAttendance(formFilterData);
    handleGetEvents({
      start_date: moment().format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    });
  }, []);

  const handleGetEvents = async (params: any) => {
    try {
      let res = await getEvents(params);
      setEvents(res?.data?.data);

      if (res?.data?.data) {
        handleGetAttendance({
          ...formFilterData,
          eventId: res?.data?.data[0]?.id,
        });
      }
    } catch (error) {
      console.log('Fetch events error: ', error);
    }
  };

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

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Attendance" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <select
              onChange={(e: any) => {
                handleGetAttendance({
                  ...formFilterData,
                  eventId: e.target.value,
                });
              }}
              className="border border-slate-400 rounded-lg w-full px-4 py-2 my-3"
            >
              {events?.map((e: any) => (
                <option className="text-center" key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
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
