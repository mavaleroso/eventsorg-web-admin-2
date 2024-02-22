'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react';
import Table from '@/components/Table';
import { addUser, deleteCustomer, getUserById, getUsers, updateUser } from '@/services/users/api';
import Modal from '@/components/Modal';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ZodError, z } from 'zod';
import { Dialog } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import SlideOvers from '@/components/SildeOvers';
import ConfirmDialog from '@/components/ConfirmDialog';
import QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';

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
  password: z
    .string()
    .min(1, {
      message: 'Password is required',
    })
    .refine((data) => data.length >= 8, {
      message: 'Password must be at least 8 characters long',
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
  endorser_id: string;
}

const UsersPage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [slideOverState, setSlideOverState] = useState(false);
  const [confirmDialogState, setConfirmDialogState] = useState(false);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedEndorser, setSelectedEndorser] = useState([]);
  const [query, setQuery] = useState('');
  const [queryEndorsed, setQueryEndorsed] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [userId, setUserId] = useState(null);
  const [qrModalState, setQrModalState] = useState(false);
  const elementRef = useRef(null);
  const [qrValue, setQrValue] = useState('');
  const [nickname, setNickname] = useState(undefined);
  const [formFilterData, setFormFilterData] = useState({
    field_name: '',
    name: '',
    viber_no: '',
    sorting: 'asc',
    language_code: 'en-US',
    limit: 10,
    page: 1,
  });

  const initialFormData: interUserFormData = {
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
    endorser_id: '',
  };

  const columns = [
    {
      title: 'Name',
      index: 'first_name',
      render: (dom: any, record: any) => {
        const fullname = `${record.first_name || ''} ${record.last_name || ''} ${record.suffix || ''}`;
        return <h5 className="font-medium text-black dark:text-white">{fullname || '-'}</h5>;
      },
    },
    {
      title: 'Viber number',
      index: 'viber_no',
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
      title: 'Actions',
      index: 'id',
      render: (dom: any, record: any) => {
        return (
          <div>
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => editUser(dom)}
                className="bg-primary text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
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
              <button
                onClick={() => viewUser(dom)}
                className="bg-slate-400 text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
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
              <button
                onClick={() => deleteUser(dom)}
                className="bg-danger text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
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
              <button
                onClick={() => viewQrCode(record)}
                className="bg-black text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 xl:mr-1 lg:mr-1"
                >
                  <path d="M4.75 4.25a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Z" />
                  <path
                    fillRule="evenodd"
                    d="M2 3.5A1.5 1.5 0 0 1 3.5 2H6a1.5 1.5 0 0 1 1.5 1.5V6A1.5 1.5 0 0 1 6 7.5H3.5A1.5 1.5 0 0 1 2 6V3.5Zm1.5 0H6V6H3.5V3.5Z"
                    clipRule="evenodd"
                  />
                  <path d="M4.25 11.25a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
                  <path
                    fillRule="evenodd"
                    d="M2 10a1.5 1.5 0 0 1 1.5-1.5H6A1.5 1.5 0 0 1 7.5 10v2.5A1.5 1.5 0 0 1 6 14H3.5A1.5 1.5 0 0 1 2 12.5V10Zm1.5 2.5V10H6v2.5H3.5Z"
                    clipRule="evenodd"
                  />
                  <path d="M11.25 4.25a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Z" />
                  <path
                    fillRule="evenodd"
                    d="M10 2a1.5 1.5 0 0 0-1.5 1.5V6A1.5 1.5 0 0 0 10 7.5h2.5A1.5 1.5 0 0 0 14 6V3.5A1.5 1.5 0 0 0 12.5 2H10Zm2.5 1.5H10V6h2.5V3.5Z"
                    clipRule="evenodd"
                  />
                  <path d="M8.5 9.417a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM8.5 13.083a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM13.083 8.5a.917.917 0 1 0 0 1.833.917.917 0 0 0 0-1.833ZM12.166 13.084a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM11.25 10.333a.917.917 0 1 0 0 1.833.917.917 0 0 0 0-1.833Z" />
                </svg>
                <span className="hidden xl:block lg:block text-nowrap">QR Code</span>
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    handleGetUser(formFilterData);
  }, []);

  const handleGetUser = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getUsers([], params);

      setTableData(res?.data.data);
      setTableMetaData(res?.data.meta);

      setFormFilterData({
        ...formFilterData,
        ['limit']: res?.data.meta.per_page,
        ['page']: res?.data.meta.current_page,
      });
    } catch (error) {
      console.log('error: ', error);
    }
    setLoading(false);
  };

  const editUser = async (id: number) => {
    setSelectedCity([]);
    setSelectedEndorser([]);
    setPreviewImage(null);
    setCapturedImage(null);
    try {
      toast.loading('Loading...');
      const res = await getUserById(id);
      setUserFormData(res?.data?.data);
      // setSelectedCity([cities[0]]);
      // setSelectedEndorser(user[0]);
      setPreviewImage(res?.data?.data?.photo);
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching user!');
    }
    setIsNew(false);
    setModalState(true);
  };

  const viewUser = async (id: number) => {
    try {
      toast.loading('Loading...');
      const res = await getUserById(id);
      setUserFormData(res?.data?.data);
      // setSelectedCity([cities[0]]);
      // setSelectedEndorser(user[0]);
      setPreviewImage(res?.data?.data?.photo);
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching user!');
    }
    setSlideOverState(true);
  };

  const deleteUser = (id: any) => {
    setUserId(id);
    setConfirmDialogState(true);
  };

  const viewQrCode = (record: any) => {
    setQrValue(record?.id_no);
    setNickname(record?.nickname);
    setQrModalState(true);
  };

  const filteredCity =
    query === ''
      ? cities
      : cities.filter((city) =>
          city.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, '')),
        );

  const filteredUsers =
    queryEndorsed === ''
      ? tableData
      : tableData.filter((user) =>
          // @ts-ignore
          user?.first_name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(queryEndorsed.toLowerCase().replace(/\s+/g, '')),
        );

  const handleFilterFormSumbmit = (e: any) => {
    e.preventDefault();
    const nonEmptyValues = Object.fromEntries(
      Object.entries(formFilterData).filter(([_, value]) => {
        return (
          (typeof value === 'string' && value.trim() !== '') ||
          (typeof value === 'number' && value !== 0)
        );
      }),
    );

    handleGetUser(nonEmptyValues);
  };

  const handleFilterInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormFilterData({
      ...formFilterData,
      [name]: value,
    });
  };

  const handleModal = (state: boolean) => {
    setSelectedCity([]);
    setSelectedEndorser([]);
    setValidationErrors(null);
    setModalState(state);
  };

  const handleQrModal = (state: boolean) => {
    setQrModalState(state);
  };

  const handleSlideOver = (state: boolean) => {
    setSlideOverState(state);
  };

  const handleConfirmDialog = (state: boolean) => {
    setConfirmDialogState(state);
  };

  const handleConfirmDelete = async () => {
    try {
      await toast.promise(deleteCustomer(userId, {}), {
        loading: 'Loading...',
        success: 'Successfully Deleted!',
        error: 'Error data deletion.',
      });
      setConfirmDialogState(false);
      handleGetUser(formFilterData);
    } catch (error) {
      console.log('delete user error', error);
    }
  };

  const [userFormData, setUserFormData] = useState<interUserFormData>(initialFormData);

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

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userFormSchema.parseAsync(userFormData);

      await toast.promise(addUser(userFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Created!',
        error: 'Error data creation.',
      });

      setModalState(false);
      setUserFormData(initialFormData);
      setCapturedImage(null);
      setPreviewImage(null);
      handleGetUser(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userFormSchema.parseAsync(userFormData);

      await toast.promise(updateUser(userFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Updated!',
        error: 'Error data on update.',
      });

      setModalState(false);
      setUserFormData(initialFormData);
      setCapturedImage(null);
      setPreviewImage(null);
      handleGetUser(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCameraMode(false);
    setCapturedImage(null);

    const file = event.target.files?.[0];

    if (file) {
      // Check if the selected file is an image
      if (file.type.startsWith('image/')) {
        const maxSizeInBytes = 2 * 1024 * 1024;

        if (file.size <= maxSizeInBytes) {
          const fileReader = new FileReader();
          fileReader.addEventListener('load', () => {
            const image = new Image();
            image.src = fileReader.result as string;

            image.onload = () => {
              // Create a canvas element to manipulate the image quality
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d')!;
              canvas.width = image.width;
              canvas.height = image.height;

              // Draw the image on the canvas with the desired quality (0.1 to 1.0)
              context.drawImage(image, 0, 0, image.width, image.height);

              // Convert the canvas content to a data URL with the specified quality
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Adjust quality as needed

              setPreviewImage(dataUrl);
              setUserFormData((prevState) => {
                return {
                  ...prevState,
                  photo: dataUrl,
                };
              });
            };
          });

          fileReader.readAsDataURL(file);
        } else {
          toast.error('Please upload image not more than 2mb size.');
        }

        // Read the file as a data URL
      } else {
        // Handle non-image file types
        console.error('Please select an image file');
      }
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
  ``;
  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataURL = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataURL);
        setIsCameraMode(false);

        setUserFormData((prevState) => {
          return {
            ...prevState,
            photo: imageDataURL as string,
          };
        });
      }
    }
  };

  const handleSelectedEndorser = (e: any) => {
    setSelectedEndorser(e);
    const event = {
      target: {
        name: 'endorser_id',
        value: e.id,
      },
    };
    handleInputChange(event);
  };

  const htmlToImageConvert = async () => {
    //@ts-ignore
    toPng(elementRef.current, { cacheBust: false })
      .then(async (dataUrl) => {
        const img = await fetch(dataUrl);
        const imgBlob = await img.blob();

        // const link = document.createElement("a");
        // link.download = "my-image-name.png";
        navigator.clipboard.write([
          new ClipboardItem({
            'image/png': imgBlob, // change image type accordingly
          }),
        ]);
        toast.success('Image copied.');

        // link.href = dataUrl;
        // link.click();
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  return (
    <DefaultLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmDialog
        state={confirmDialogState}
        title={'Delete user'}
        message={'Are you sure you want to delete this user?'}
        dialogFn={handleConfirmDialog}
        confirmFn={handleConfirmDelete}
      />
      <SlideOvers slideOverState={slideOverState} slideOverFn={handleSlideOver}>
        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
          <h3 className="text-base font-semibold leading-7 text-gray-900">User Information</h3>
        </Dialog.Title>
        <div className="mt-6">
          <dl className="divide-y divide-gray-3">
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">First name:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.first_name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Last name:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.last_name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Middle name:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.middle_name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Suffix:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.suffix || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Nickname:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.nickname || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Gender:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.gender || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Birthdate:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.birthdate || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">City:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.city || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Viber no.:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.viber_no || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Email:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.email || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Membership date:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.membership_date || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Endorsed by:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0"></dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Membership status:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.status || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Membership position:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {userFormData?.position || '-'}
              </dd>
            </div>
          </dl>
        </div>
      </SlideOvers>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Users" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <Modal modalState={modalState} modalFn={handleModal} modalWidth={'w-[800px]'}>
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-black dark:text-white mb-5"
              >
                {isNew ? 'New' : 'Edit'} user
              </Dialog.Title>
              <form onSubmit={(e) => (isNew ? handleUserSubmit(e) : handleUserUpdate(e))}>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-3">
                    <div className="relative h-35 w-40 border border-dashed border-slate-400 rounded-lg mx-auto bg-slate-100 flex items-center justify-center">
                      {isCameraMode && (
                        <video ref={videoRef} autoPlay playsInline className="h-35 w-40" />
                      )}
                      {capturedImage && (
                        <img src={capturedImage} alt="captured-image" className="p-1" />
                      )}
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="preview-image"
                          className="h-35 w-40 overflow-hidden rounded-lg p-1"
                        />
                      ) : null}

                      {!isCameraMode && (
                        <button
                          type="button"
                          onClick={uploadImage}
                          className="absolute top-0 mt-2 bg-slate-100 border border-slate-400 bg-opacity-50 text-black rounded-md p-1 text-xs hover:opacity-70"
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
                        type="button"
                        onClick={isCameraMode ? captureFrame : () => setIsCameraMode(true)}
                        className="absolute bottom-0 w-full overflow-hidden bg-white rounded-b-lg shadow-sm hover:opacity-90 text-sm p-1"
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
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'last_name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
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
                      value={userFormData.suffix || ''}
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
                      value={userFormData.gender || ''}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'gender') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                      // className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Femal</option>
                      <option value="rather not to say">Rather not to say</option>
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
                    <Combobox name="city" value={selectedCity} onChange={setSelectedCity}>
                      <div className="relative">
                        <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                          <Combobox.Input
                            name="city"
                            className="w-full border-none pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none dark:bg-form-input dark:text-white"
                            displayValue={(city: any) => city.label}
                            onChange={(event) => {
                              event.target.name = 'city';
                              setQuery(event.target.value);
                              setTimeout(() => {
                                handleInputChange(event);
                              }, 2000);
                            }}
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
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'viber_no') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
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
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Password</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Please enter"
                      value={userFormData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'password') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary'}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'password')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
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
                    <Combobox
                      name="endorser_id"
                      value={selectedEndorser}
                      onChange={handleSelectedEndorser}
                    >
                      <div className="relative">
                        <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                          <Combobox.Input
                            name="endorser_id"
                            className="w-full border-none pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none dark:bg-form-input dark:text-white"
                            displayValue={(user: any) => user.first_name}
                            onChange={(event) => {
                              setQueryEndorsed(event.target.value);
                            }}
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
                          afterLeave={() => setQueryEndorsed('')}
                        >
                          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {filteredUsers?.length === 0 && queryEndorsed !== '' ? (
                              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                Nothing found.
                              </div>
                            ) : (
                              filteredUsers?.map((user: any) => (
                                <Combobox.Option
                                  key={user?.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                    }`
                                  }
                                  value={user}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? 'font-medium' : 'font-normal'
                                        }`}
                                      >
                                        {/* @ts-ignore */}
                                        {user.first_name}
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
                      value={userFormData.status || ''}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="prospect">Prospect</option>
                      <option value="regular">Regular</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Membership position
                    </label>
                    <select
                      name="position"
                      value={userFormData.position || ''}
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
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isNew ? `Create` : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      setModalState(false);
                      setUserFormData(initialFormData);
                      setCapturedImage(null);
                      setPreviewImage(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>
            <Modal modalState={qrModalState} modalFn={handleQrModal} modalWidth={'w-full max-w-sm'}>
              <Dialog.Title
                as="h1"
                className="text-title-lg text-center font-bold leading-6 text-black dark:text-white "
              >
                QR Code
              </Dialog.Title>
              <div ref={elementRef} style={{ backgroundColor: 'white' }}>
                <QRCode
                  id="qr-gen"
                  value={qrValue}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  size={250}
                  bgColor={'#ffffff'}
                  fgColor={'#000000'}
                  level={'L'}
                  includeMargin={true}
                />
                <span className="block px-4 py-2 rounded-lg bg-slate-200 mx-auto text-xl text-center font-bold leading-6 text-black dark:text-white">
                  {nickname || '-'}
                </span>
              </div>

              <button
                onClick={htmlToImageConvert}
                className="bg-primary px-4 py-2 block w-full rounded-lg mt-2 text-white hover:opacity-75"
              >
                Copy QR Code
              </button>
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
            <form onSubmit={handleFilterFormSumbmit}>
              <div className="grid xl:grid-cols-5 gap-4 my-5">
                <div className="col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Name
                  </label>
                  <div className="flex items-center gap-1">
                    <select
                      name="field_name"
                      value={formFilterData.field_name}
                      onChange={handleFilterInputChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-body dark:text-bodydark"></option>
                      <option value="name" className="text-body dark:text-bodydark">
                        Name
                      </option>
                      <option value="viber" className="text-body dark:text-bodydark">
                        Viber
                      </option>
                      <option value="nickname" className="text-body dark:text-bodydark">
                        Nickname
                      </option>
                      <option value="status" className="text-body dark:text-bodydark">
                        Status
                      </option>
                    </select>
                    <input
                      type="text"
                      name="name"
                      value={formFilterData.name}
                      onChange={handleFilterInputChange}
                      placeholder="Search Name"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Viber Number
                  </label>
                  <input
                    type="text"
                    name="viber_no"
                    value={formFilterData.viber_no}
                    onChange={handleFilterInputChange}
                    placeholder="Search viber number"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="" className="text-body dark:text-bodydark"></option>
                    <option value="regular" className="text-body dark:text-bodydark">
                      Regular
                    </option>
                    <option value="prospect" className="text-body dark:text-bodydark">
                      Prospect
                    </option>
                    <option value="guest" className="text-body dark:text-bodydark">
                      Guest
                    </option>
                  </select>
                </div>
                <div className="content-center">
                  <div className="flex items-center gap-2 justify-end mt-8">
                    <button
                      className="bg-primary text-white rounded inline-flex px-4 py-2 hover:bg-opacity-50"
                      type="submit"
                    >
                      <span className="mr-2">Search</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="bg-slate-300 text-black rounded inline-flex px-4 py-2 hover:bg-opacity-50"
                      onClick={() => {
                        setFormFilterData({
                          field_name: '',
                          name: '',
                          viber_no: '',
                          sorting: 'asc',
                          language_code: 'en-US',
                          limit: 10,
                          page: 1,
                        });
                      }}
                    >
                      <span className="mr-2">Reset</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <Table
              columns={columns}
              tableData={tableData}
              metaData={tableMetaData}
              tableFn={handleGetUser}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UsersPage;
