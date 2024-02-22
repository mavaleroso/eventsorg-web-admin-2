'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { getAttendance } from '@/services/attendance/api';
import { getEvents } from '@/services/events/api';
import Modal from '@/components/Modal';
import moment from 'moment';
import Tesseract from 'tesseract.js';
// @ts-ignore
import fx from 'glfx';
import { postAttendance } from '@/services/checkin/api';
import { Dialog } from '@headlessui/react';
import QrReader from 'react-web-qr-reader';
import toast, { Toaster } from 'react-hot-toast';
// @ts-ignore
import store from 'store';
import { useRouter } from 'next/navigation';

const CheckinPage = () => {
  const router = useRouter();
  const token = store.get('accessToken');
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [delay, setDelay] = useState(100);
  const [cameraOption, setCameraOption] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrModalState, setOcrModalState] = useState(false);
  const [ocr, setOcr] = useState('');
  const [userInfo, setuserInfo] = useState([]);
  const [formFilterData, setFormFilterData] = useState({
    eventId: null,
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
      title: 'Status',
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
    handleGetEvents({
      start_date: moment().format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    });
  }, []);

  const handleGetAttendance = async (id: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getAttendance({
        ...formFilterData,
        eventId: id,
      });

      setFormFilterData({
        ...formFilterData,
        ['limit']: res?.data?.data?.meta?.per_page,
        ['page']: res?.data?.data?.meta?.current_page,
      });

      setTableData(res?.data?.data);
      setTableMetaData(res?.data?.meta);
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

  const handleGetEvents = async (params: any) => {
    const searchParams = new URLSearchParams(window.location.search);

    const param1 = searchParams.get('event_id');
    try {
      let res = await getEvents(params);
      if (res?.data?.data.length == 0) {
        setModalState(true);
      } else {
        setEvents(res?.data?.data);
        setCameraOption('QR');
        handleGetAttendance(res?.data?.data[0]?.id);
        setEventId(param1 ?? res?.data?.data[0]?.id);
      }
    } catch (error) {
      console.log('Fetch events error: ', error);
    }
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  const handleScan = async (data: any) => {
    if (data) {
      toast.success('Scanned QR code');
      // setResult(data?.data);
      handleAttendance(data?.data);
      setCameraOption('');
    }
  };

  const handleAttendance = async (data: any) => {
    setIsScanning(true);

    let payload = {
      event_id: eventId,
      id_no: data,
    };

    try {
      let res = await postAttendance(payload);
      setuserInfo(res?.data?.data);
      // message.success('Attendance saved.');
      // setResult(null);
      handleGetEvents({
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
      });
    } catch (error) {
      console.log(error);
      // message.error(error?.response?.data?.message);
    }
    setIsScanning(false);
    setCameraOption('QR');
  };

  useEffect(() => {
    handleGetEvents({
      start_date: moment().format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    });
  }, []);

  const captureFrame = async () => {
    var fxCanvas = null;
    var texture = null;
    var canvas = document.querySelector('canvas');
    var video = document.querySelector('video');

    if (video && canvas) {
      fxCanvas = fx.canvas();

      canvas.width = video?.videoWidth;
      canvas.height = video?.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      texture = fxCanvas.texture(canvas);
      fxCanvas
        .draw(texture)
        .hueSaturation(-1, -1)
        .unsharpMask(20, 2)
        .brightnessContrast(0.2, 0.9)
        .update();

      console.log('scanning...');
      toast.loading('OCR Scanning...');

      Tesseract.recognize(fxCanvas.toDataURL()).then(function (result) {
        const filteredText = result ? result.data.text.replace(/[^A-Z0-9]/g, '') : '';
        console.log(`done: ${filteredText}`);
        toast.dismiss();
        setOcr(filteredText);
        if (filteredText.length > 1) {
          setOcrModalState(true);
        } else {
          captureFrame();
        }
      });
    }
  };

  const handleOCRModal = (state: boolean) => {
    setOcrModalState(state);
  };

  return (
    <DefaultLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <Modal
        modalState={ocrModalState}
        modalFn={handleOCRModal}
        close={false}
        modalWidth="w-full max-w-sm"
      >
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-black dark:text-white mb-5"
        >
          Extracted OCR plate number
        </Dialog.Title>
        <h1 className="text-title-md font-bold text-black">{ocr}</h1>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-75"
            onClick={() => {
              setOcrModalState(false);
              captureFrame();
            }}
          >
            Continue
          </button>
          <button
            className="bg-slate-200 text-black px-4 py-2 rounded hover:opacity-75"
            onClick={() => {
              setOcrModalState(false);
              toast.error('OCR scanning stopped');
            }}
          >
            stop
          </button>
        </div>
      </Modal>
      <Modal
        modalState={modalState}
        modalFn={handleModal}
        close={false}
        modalWidth="w-full max-w-sm"
      >
        <div className="h-full flex flex-col items-center justify-center gap-4 content-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-32 h-32 text-primary drop-shadow-md"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>

          <div>
            <h1 className="text-title-md font-bold text-black">No active events</h1>
            <p className="text-lg font-semibold text-center">Check again later.</p>
          </div>

          <button
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-75"
            onClick={() => {
              setModalState(false);
              router.push('/events');
            }}
          >
            Ok
          </button>
        </div>
      </Modal>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Member Check In" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 my-4 rounded-md">
                <div className="flex items-center justify-center gap-2">
                  <select
                    onChange={(e: any) => {
                      setEventId(e.target.value);
                      setCameraOption('QR');
                      handleGetAttendance(e.target.value);
                    }}
                    className="border border-slate-400 rounded-lg w-full px-4 py-2 my-3"
                  >
                    {events?.map((event: any) => (
                      <option key={event.id} value={event.id} className="text-center">
                        {event.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      captureFrame();
                      toast.success('OCR scanning started');
                    }}
                    className="bg-slate-200 font-semibold hover:opacity-70 text-black rounded-md px-4 py-2 text-sm"
                  >
                    OCR
                  </button>
                </div>

                <div className="w-40 h-40 bg-slate-100 rounded-lg border border-dashed mx-auto">
                  {cameraOption == 'QR' ? (
                    //@ts-ignore
                    <QrReader
                      delay={delay}
                      //style={previewStyle}
                      onScan={(data: any) => {
                        handleScan(data);
                      }}
                      style={{ width: '100%', height: '100%' }}
                      onError={() => {}}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-18 h-18"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border border-slate-200 my-4 rounded-md grid grid-cols-2 gap-4">
                {/* <img
                  src=""
                  alt=""
                  className="w-50 h-50 bg-slate-100 rounded-lg border border-dashed"
                /> */}
                <div
                  className={`h-full flex items-center justify-center content-center ${!userInfo?.first_name ? 'col-span-2' : ''}`}
                >
                  {userInfo?.photo ? (
                    <img
                      src={userInfo?.photo}
                      alt=""
                      className="w-50 h-50 bg-slate-100 rounded-lg border border-dashed"
                    />
                  ) : (
                    <img
                      src="data:image/png;base64,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"
                      alt=""
                      className="w-50 h-50 bg-slate-100 rounded-lg border border-dashed"
                    />
                  )}
                </div>

                {userInfo?.first_name && (
                  <div className="mt-5">
                    <h3 className="font-bold text-slate-700 dark:text-white text-title-md text-center">
                      Welcome
                    </h3>
                    <p className="text-center font-semibold text-black dark:text-white text-title-sm  mt-3">
                      {userInfo?.first_name} {userInfo?.last_name}
                    </p>
                    <p className="text-center font-semibold dark:text-white text-lg ">
                      {userInfo?.status}
                    </p>

                    <p className="text-center font-semibold text-slate-500 dark:text-white text-lg mt-4">
                      {userInfo?.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <canvas style={{ display: 'none' }}></canvas>
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

export default CheckinPage;
