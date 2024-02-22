'use client';

import { Metadata } from 'next';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react';
import Table from '@/components/Table';
import { getUsers } from '@/services/users/api';
import Modal from '@/components/Modal';
import flatpickr from 'flatpickr';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ZodError, z } from 'zod';
import { getProducts } from '@/services/products/api';
// export const metadata: Metadata = {
//   title: "Events Org | Users",
// };

const cities = [
  { label: 'Bacoor', value: 'Bacoor' },
  { label: 'Bagong Pag-Asa', value: 'Bagong Pag-Asa' },
  { label: 'Baclaran', value: 'Baclaran' },
  { label: 'Bagong Silangan', value: 'Bagong Silangan' },
  { label: 'Bagumbayan', value: 'Bagumbayan' },
  {
    label: 'Banco Filipino International Village',
    value: 'Banco Filipino International Village',
  },
  { label: 'Bayanan', value: 'Bayanan' },
  { label: 'Bel-Air', value: 'Bel-Air' },
  { label: 'Bignay', value: 'Bignay' },
  { label: 'Caloocan City', value: 'Caloocan City' },
  { label: 'Canagatan', value: 'Canagatan' },
  { label: 'Central Signal Village', value: 'Central Signal Village' },
  { label: 'Parañaque', value: 'Parañaque' },
  { label: 'Davao', value: 'Davao' },
  { label: 'Don Bosco', value: 'Don Bosco' },
  { label: 'General Mariano Alvarez', value: 'General Mariano Alvarez' },
  { label: 'Karuhatan', value: 'Karuhatan' },
  { label: 'Las Piñas City', value: 'Las Piñas City' },
  { label: 'Lower Bicutan', value: 'Lower Bicutan' },
  { label: 'Malabon', value: 'Malabon' },
  { label: 'Malate', value: 'Malate' },
  { label: 'Mandaluyong City', value: 'Mandaluyong City' },
  { label: 'Manila', value: 'Manila' },
  { label: 'Marikina Heights', value: 'Marikina Heights' },
  { label: 'Navotas', value: 'Navotas' },
  { label: 'Paco', value: 'Paco' },
  { label: 'Pandacan', value: 'Pandacan' },
  { label: 'Pansol', value: 'Pansol' },
  { label: 'Pasay City', value: 'Pasay City' },
  { label: 'Pasig City', value: 'Pasig City' },
  { label: 'Pateros', value: 'Pateros' },
  { label: 'Payatas', value: 'Payatas' },
  { label: 'Pinyahan', value: 'Pinyahan' },
  { label: 'Poblacion', value: 'Poblacion' },
  { label: 'Putatan', value: 'Putatan' },
  { label: 'Quezon City', value: 'Quezon City' },
  { label: 'San Andres', value: 'San Andres' },
  { label: 'San Antonio', value: 'San Antonio' },
  { label: 'San Isidro', value: 'San Isidro' },
  { label: 'San Juan', value: 'San Juan' },
  { label: 'San Pedro', value: 'San Pedro' },
  { label: 'Santa Ana', value: 'Santa Ana' },
  { label: 'Santa Cruz', value: 'Santa Cruz' },
  { label: 'Santamesa', value: 'Santamesa' },
  { label: 'Santo Niño', value: 'Santo Niño' },
  { label: 'Sucat', value: 'Sucat' },
  { label: 'Taguig City', value: 'Taguig City' },
  { label: 'Tatalon', value: 'Tatalon' },
  { label: 'Tondo', value: 'Tondo' },
  { label: 'Upper Bicutan', value: 'Upper Bicutan' },
  { label: 'Valenzuela', value: 'Valenzuela' },
  { label: 'West Rembo', value: 'West Rembo' },
  { label: 'Western Bicutan', value: 'Western Bicutan' },
];

const userFormSchema = z.object({
  first_name: z.string().min(1, {
    message: 'First name is required',
  }),
  last_name: z.string().min(1, {
    message: 'Last name is required',
  }),
  gender: z.string().min(1, {
    message: 'Gender is required',
  }),
  viber_no: z.string().min(1, {
    message: 'Viber no. is required',
  }),
});

interface interUserFormData {
  birthdate: string;
  city: string;
  confirm_password: string;
  email: string;
  first_name: string;
  gender: string;
  last_name: string;
  membership_date: string;
  middle_name: string;
  nickname: string;
  password: string;
  photo: string;
  position: string;
  status: string;
  suffix: string;
  viber_no: string;
  endorsed_id: string;
}

const ProductsPage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [selected, setSelected] = useState(cities[0]);
  const [query, setQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [formFilterData, setFormFilterData] = useState({
    limit: 10,
    page: 1,
  });

  const filteredCity =
    query === ''
      ? cities
      : cities.filter((city) =>
          city.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, '')),
        );

  const columns = [
    {
      title: 'Name',
      index: 'name',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Sku',
      index: 'sku',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Price',
      index: 'price',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom || '-'}</h5>;
      },
    },
    {
      title: 'Category',
      index: 'category',
      render: (dom: any) => {
        return <h5 className="font-medium text-black dark:text-white">{dom?.name || '-'}</h5>;
      },
    },
    {
      title: 'Actions',
      index: 'id',
      render: (dom: any) => {
        return (
          <div className="flex items-center justify-end gap-1">
            <button className="bg-primary text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 xl:mr-1 lg:mr-1"
              >
                <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
              </svg>
              <span className="hidden xl:block lg:block">Edit</span>
            </button>
            <button className="bg-slate-400 text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 xl:mr-1 lg:mr-1"
              >
                <path d="M7.25 3.688a8.035 8.035 0 0 0-4.872-.523A.48.48 0 0 0 2 3.64v7.994c0 .345.342.588.679.512a6.02 6.02 0 0 1 4.571.81V3.688ZM8.75 12.956a6.02 6.02 0 0 1 4.571-.81c.337.075.679-.167.679-.512V3.64a.48.48 0 0 0-.378-.475 8.034 8.034 0 0 0-4.872.523v9.268Z" />
              </svg>
              <span className="hidden xl:block lg:block">View</span>
            </button>
            <button className="bg-danger text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 xl:mr-1 lg:mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden xl:block lg:block">Delete</span>
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    handleGetProducts(formFilterData);
  }, []);

  const handleGetProducts = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getProducts([], params);

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

  const [userFormData, setUserFormData] = useState<interUserFormData>({
    birthdate: '',
    city: '',
    confirm_password: '',
    email: '',
    first_name: '',
    gender: '',
    last_name: '',
    membership_date: '',
    middle_name: '',
    nickname: '',
    password: '',
    photo: '',
    position: '',
    status: '',
    suffix: '',
    viber_no: '',
    endorsed_id: '',
  });

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setUserFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleBlur = async (e: any) => {
    try {
      // Validate the form data when the field is blurred
      await userFormSchema.parseAsync(userFormData);
      // If validation is successful, reset errors
      setValidationErrors(null);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
      }
    }
  };

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userFormSchema.parseAsync(userFormData);

      console.log('userFormData', userFormData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleUploadImage = () => {
    if (previewImage) {
      const data = new FormData();
      data.append('files[]', previewImage);

      // fetch(/* server url */, { method: 'POST', body: data })
      //     .then(async (response) => {
      //         const imageResponse = await response.json();
      //         setUploadedImage(imageResponse);
      //     })
      //     .catch((err) => {
      //         // Handle error
      //     });
    }
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCameraMode(false);
    setCapturedImage(null);

    const file = event.target.files?.[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        setPreviewImage(fileReader.result as string);
      });
      fileReader.readAsDataURL(file);
    }
  };

  const uploadImage = () => {
    // Trigger the click event of the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (isCameraMode) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraMode]);

  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setPreviewImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          // Adjust canvas size based on video dimensions
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current!.videoWidth;
          canvas.height = videoRef.current!.videoHeight;
        };
        videoRef.current.play();
      }
      mediaStreamRef.current = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataURL = canvas.toDataURL('image/png');
        setCapturedImage(imageDataURL);
        setIsCameraMode(false);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Products" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <Modal modalState={modalState} modalFn={handleModal}>
              <form onSubmit={handleNewUserSubmit}>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-3">
                    <div className="relative h-35 w-40 border border-dashed border-slate-400 rounded-lg mx-auto bg-slate-100 flex items-center justify-center">
                      {isCameraMode && (
                        <video ref={videoRef} autoPlay playsInline className=" h-35 w-40" />
                      )}
                      {capturedImage && <img src={capturedImage} alt="captured-image" />}
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="preview-image"
                          className="h-35 w-40 overflow-hidden rounded-lg"
                        />
                      ) : null}

                      {!isCameraMode && (
                        <button
                          onClick={uploadImage}
                          className="absolute top-0 mt-10 bg-transparent text-black rounded-lg p-2"
                        >
                          Upload
                        </button>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleSelectImage}
                      />
                      <button
                        onClick={isCameraMode ? captureFrame : () => setIsCameraMode(true)}
                        className="absolute bottom-0 w-full overflow-hidden bg-white rounded-b-lg shadow-sm hover:opacity-50 text-sm p-1"
                      >
                        {isCameraMode ? 'Capture Photo' : 'Take a photo'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">First name</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Please enter"
                      value={userFormData.first_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'first_name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'first_name')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Last name</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Please enter"
                      value={userFormData.last_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'first_name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'last_name')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Middle name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      placeholder="Please enter"
                      value={userFormData.middle_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Suffix
                    </label>
                    <select
                      name="suffix"
                      value={userFormData.suffix}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="SR">SR</option>
                      <option value="JR">JR</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Please enter"
                      value={userFormData.nickname}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Gender</span>
                    </label>
                    <select
                      name="gender"
                      value={userFormData.gender}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'first_name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                      // className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Femal</option>
                      <option value="Rather not to say">Rather not to say</option>
                    </select>
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'gender')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      name="birthdate"
                      placeholder="Please enter"
                      value={userFormData.birthdate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      City
                    </label>
                    <Combobox name="city" value={selected} onChange={setSelected}>
                      <div className="relative">
                        <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                          <Combobox.Input
                            name="city"
                            className="w-full border-none pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                            displayValue={(city: any) => city.label}
                            onChange={(event) => {
                              setQuery(event.target.value);
                              setTimeout(() => {
                                handleInputChange(event);
                              }, 1000);
                            }}
                            // value={userFormData.city}
                            // onBlur={handleBlur}
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Combobox.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setQuery('')}
                        >
                          <Combobox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {filteredCity.length === 0 && query !== '' ? (
                              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                Nothing found.
                              </div>
                            ) : (
                              filteredCity.map((city, i) => (
                                <Combobox.Option
                                  key={i}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                    }`
                                  }
                                  value={city}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? 'font-medium' : 'font-normal'
                                        }`}
                                      >
                                        {city.label}
                                      </span>
                                      {selected ? (
                                        <span
                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                            active ? 'text-white' : 'text-teal-600'
                                          }`}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Viber no.</span>
                    </label>
                    <input
                      type="text"
                      name="viber_no"
                      placeholder="Please enter"
                      value={userFormData.viber_no}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'first_name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'viber_no')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Please enter"
                      value={userFormData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Please enter"
                      value={userFormData.confirm_password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Membership date
                    </label>
                    <input
                      type="date"
                      name="membership_date"
                      placeholder="Please enter"
                      value={userFormData.membership_date}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Endorsed by
                    </label>
                    <Combobox value={selected} onChange={setSelected}>
                      <div className="relative">
                        <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                          <Combobox.Input
                            className="w-full border-none pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                            displayValue={(city: any) => city.label}
                            onChange={(event) => {
                              setQuery(event.target.value);
                              handleInputChange(event);
                            }}
                            value={userFormData.endorsed_id}
                            onBlur={handleBlur}
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Combobox.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setQuery('')}
                        >
                          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {filteredCity.length === 0 && query !== '' ? (
                              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                Nothing found.
                              </div>
                            ) : (
                              filteredCity.map((city, i) => (
                                <Combobox.Option
                                  key={i}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                    }`
                                  }
                                  value={city}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? 'font-medium' : 'font-normal'
                                        }`}
                                      >
                                        {city.label}
                                      </span>
                                      {selected ? (
                                        <span
                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                            active ? 'text-white' : 'text-teal-600'
                                          }`}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Membership status
                    </label>
                    <select
                      name="status"
                      value={userFormData.status}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="Prospect">Prospect</option>
                      <option value="Regular">Regular</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Membership position
                    </label>
                    <select
                      name="position"
                      value={userFormData.position}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="Member">Member</option>
                      <option value="President">President</option>
                      <option value="Vice president">Vice president</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-5">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      setModalState(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>
            <div className="flex items-center gap-2 justify-end my-2">
              <button
                onClick={() => {
                  setModalState(true);
                }}
                className="bg-primary text-white rounded inline-flex px-4 py-2 hover:bg-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-1"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>

                <span>New</span>
              </button>
            </div>
            <Table
              columns={columns}
              tableData={tableData}
              metaData={tableMetaData}
              tableFn={handleGetProducts}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductsPage;
