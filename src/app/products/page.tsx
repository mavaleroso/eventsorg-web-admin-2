'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ZodError, object, z } from 'zod';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/services/products/api';
import { getCategories } from '@/services/category/api';
import toast, { Toaster } from 'react-hot-toast';
import SlideOvers from '@/components/SildeOvers';
import moment from 'moment';
import ConfirmDialog from '@/components/ConfirmDialog';

const productFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  sku: z.string().min(1, {
    message: 'Sku is required',
  }),
  price: z.string().min(1, {
    message: 'Price is required',
  }),
  quantity: z.string().min(1, {
    message: 'Quantity is required',
  }),
  category_id: z.string().min(1, {
    message: 'Category is required',
  }),
});

interface interProductFormData {
  name: any;
  sku: any;
  price: any;
  quantity: any;
  category_id: any;
  category: any;
  created_at: any;
  updated_at: any;
}

const ProductsPage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [categories, setCategories] = useState([]);
  const [isNew, setIsNew] = useState(true);
  const [slideOverState, setSlideOverState] = useState(false);
  const [confirmDialogState, setConfirmDialogState] = useState(false);
  const [userId, setUserId] = useState(null);
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
            <button
              onClick={() => editProduct(dom)}
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
              onClick={() => viewProduct(dom)}
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
              onClick={() => deleteProductHandler(dom)}
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
          </div>
        );
      },
    },
  ];

  const initialFormData: interProductFormData = {
    name: '',
    sku: '',
    price: '',
    quantity: '',
    category_id: '',
    created_at: '',
    updated_at: '',
    category: object,
  };

  useEffect(() => {
    handleGetProducts(formFilterData);
    handleGetCategories();
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
    }
    setLoading(false);
  };

  const handleGetCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res?.data?.data);
    } catch (error) {
      console.log('Fetch categories error:', error);
    }
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  const editProduct = async (id: any) => {
    setPreviewImage(null);
    setCapturedImage(null);
    try {
      toast.loading('Loading...');
      const res = await getProductById(id);
      setProductFormData({
        ...res?.data?.data,
        ['category_id']: res?.data.data.category ? String(res?.data.data.category.id) : '',
        ['quantity']: res?.data.data.quantity ? String(res?.data.data.quantity) : '',
      });
      setPreviewImage(res?.data?.data?.photo);
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching product!');
    }
    setIsNew(false);
    setModalState(true);
  };

  const viewProduct = async (id: number) => {
    try {
      toast.loading('Loading...');
      const res = await getProductById(id);
      setProductFormData({
        ...res?.data?.data,
        ['category_id']: String(res?.data.data.category.id),
        ['quantity']: String(res?.data.data.quantity),
      });
      setPreviewImage(res?.data?.data?.photo);
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching user!');
    }
    setSlideOverState(true);
  };

  const handleSlideOver = (state: boolean) => {
    setSlideOverState(state);
  };

  const handleConfirmDialog = (state: boolean) => {
    setConfirmDialogState(state);
  };

  const handleConfirmDelete = async () => {
    try {
      await toast.promise(deleteProduct(userId, {}), {
        loading: 'Loading...',
        success: 'Successfully Deleted!',
        error: 'Error data deletion.',
      });
      setConfirmDialogState(false);
      handleGetProducts(formFilterData);
    } catch (error) {
      console.log('delete user error', error);
    }
  };

  const deleteProductHandler = (id: any) => {
    setUserId(id);
    setConfirmDialogState(true);
  };

  const [productFormData, setProductFormData] = useState<interProductFormData>(initialFormData);

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProductFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await productFormSchema.parseAsync(productFormData);

      await toast.promise(addProduct(productFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Created!',
        error: 'Error data creation.',
      });

      setModalState(false);
      setProductFormData(initialFormData);
      setCapturedImage(null);
      setPreviewImage(null);
      handleGetProducts(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const handleProductUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await productFormSchema.parseAsync(productFormData);

      await toast.promise(updateProduct(productFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Updated!',
        error: 'Error data updating.',
      });

      setModalState(false);
      setProductFormData(initialFormData);
      setCapturedImage(null);
      setPreviewImage(null);
      handleGetProducts(formFilterData);
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
              setProductFormData((prevState) => {
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
      toast.error('No camera found!');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const captureFrame = async () => {
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

        setProductFormData((prevState) => {
          return {
            ...prevState,
            photo: imageDataURL as string,
          };
        });
      }
    }
  };

  return (
    <DefaultLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmDialog
        state={confirmDialogState}
        title={'Delete product'}
        message={'Are you sure you want to delete this product?'}
        dialogFn={handleConfirmDialog}
        confirmFn={handleConfirmDelete}
      />
      <SlideOvers slideOverState={slideOverState} slideOverFn={handleSlideOver}>
        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
          <p className="text-base font-semibold leading-7 text-gray-900">Product Information</p>
        </Dialog.Title>
        <div className="mt-6">
          <dl className="divide-y divide-gray-3">
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Name:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Sku:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.sku || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Category:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.category.name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Price:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.price || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Quantity:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.quantity || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Created at:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.created_at
                  ? moment(productFormData?.created_at)?.format('YYYY-MM-DD HH:mm')
                  : '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Updated at:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {productFormData?.updated_at
                  ? moment(productFormData?.updated_at)?.format('YYYY-MM-DD HH:mm')
                  : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </SlideOvers>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Products" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <Modal modalState={modalState} modalFn={handleModal} modalWidth={'w-full max-w-md'}>
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-black dark:text-white mb-5"
              >
                {isNew ? 'New' : 'Edit'} product
              </Dialog.Title>
              <form onSubmit={(e) => (isNew ? handleProductSubmit(e) : handleProductUpdate(e))}>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
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
                      <span className="ml-3">Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Please enter"
                      value={productFormData.name}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px] bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke '}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'name')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Sku</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      placeholder="Please enter"
                      value={productFormData.sku}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px] bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'sku') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke '}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'sku')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Price</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Please enter"
                      value={productFormData.price}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px] bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'price') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke '}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'price')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Quantity</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Please enter"
                      value={productFormData.quantity}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'quantity') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke'}`}
                    />
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'quantity')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Category</span>
                    </label>
                    <select
                      name="category_id"
                      value={productFormData.category_id}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'category_id') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke'}`}
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      {categories?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors?.errors && validationErrors.errors.length > 0 && (
                      <div className="text-red text-sm">
                        {validationErrors.errors
                          .filter((error) => error.path[0] === 'category_id')
                          .map((error, index) => (
                            <p key={index}>{error.message}</p>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-5">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isNew ? 'Create' : 'Update'}
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
                  setValidationErrors(null);
                  setProductFormData(initialFormData);
                  setIsNew(true);
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
