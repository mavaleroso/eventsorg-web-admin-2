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
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '@/services/category/api';
import toast, { Toaster } from 'react-hot-toast';
import SlideOvers from '@/components/SildeOvers';
import moment from 'moment';
import ConfirmDialog from '@/components/ConfirmDialog';

const categoryFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  parent_id: z.string().min(1, {
    message: 'Parent category is required',
  }),
});

interface interCategoryFormData {
  name: string;
  parent_id: string;
  created_at: string;
  parent_category: any;
}

const CategoryPage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [categories, setCategories] = useState([]);
  const [confirmDialogState, setConfirmDialogState] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [slideOverState, setSlideOverState] = useState(false);
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
      title: 'Parent category',
      index: 'parent_category',
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
              onClick={() => editCategory(dom)}
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
              onClick={() => viewCategory(dom)}
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
              onClick={() => deleteCategoryHandler(dom)}
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

  useEffect(() => {
    handleGetCategory(formFilterData);
    handleGetCategories();
  }, []);

  const handleGetCategory = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getCategories([], params);

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

  const editCategory = async (id: any) => {
    setValidationErrors(null);
    try {
      toast.loading('Loading...');
      const res = await getCategoryById(id);
      setCategoryFormData({
        ...res?.data?.data,
        ['parent_id']: res?.data.data.parent_category
          ? String(res?.data.data.parent_category.id)
          : '',
      });
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching category!');
    }
    setIsNew(false);
    setModalState(true);
  };

  const viewCategory = async (id: number) => {
    try {
      toast.loading('Loading...');
      const res = await getCategoryById(id);
      setCategoryFormData({
        ...res?.data?.data,
        ['parent_id']: res?.data.data.parent_category
          ? String(res?.data.data.parent_category.id)
          : '',
      });
      toast.dismiss();
    } catch (error) {
      toast.error('Error in fetching category!');
    }
    setSlideOverState(true);
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  const initialFormData: interCategoryFormData = {
    name: '',
    parent_id: '',
    created_at: '',
    parent_category: object,
  };

  const [categoryFormData, setCategoryFormData] = useState<interCategoryFormData>(initialFormData);

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setCategoryFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await categoryFormSchema.parseAsync(categoryFormData);

      await toast.promise(addCategory(categoryFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Created!',
        error: 'Error data creation.',
      });

      setModalState(false);
      setCategoryFormData(initialFormData);
      handleGetCategory(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const handleSlideOver = (state: boolean) => {
    setSlideOverState(state);
  };

  const handleCategoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await categoryFormSchema.parseAsync(categoryFormData);

      await toast.promise(updateCategory(categoryFormData, {}), {
        loading: 'Loading...',
        success: 'Successfully Updated!',
        error: 'Error data update.',
      });

      setModalState(false);
      setCategoryFormData(initialFormData);
      handleGetCategory(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error('Form validation failed:', error.errors);
      }
    }
  };

  const deleteCategoryHandler = (id: any) => {
    setUserId(id);
    setConfirmDialogState(true);
  };

  const handleConfirmDialog = (state: boolean) => {
    setConfirmDialogState(state);
  };

  const handleConfirmDelete = async () => {
    try {
      await toast.promise(deleteCategory(userId, {}), {
        loading: 'Loading...',
        success: 'Successfully Deleted!',
        error: 'Error data deletion.',
      });
      setConfirmDialogState(false);
      handleGetCategory(formFilterData);
    } catch (error) {
      console.log('delete user error', error);
    }
  };

  return (
    <DefaultLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmDialog
        state={confirmDialogState}
        title={'Delete category'}
        message={'Are you sure you want to delete this category?'}
        dialogFn={handleConfirmDialog}
        confirmFn={handleConfirmDelete}
      />
      <SlideOvers slideOverState={slideOverState} slideOverFn={handleSlideOver}>
        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
          <p className="text-base font-semibold leading-7 text-gray-900">Category Information</p>
        </Dialog.Title>
        <div className="mt-6">
          <dl className="divide-y divide-gray-3">
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Name:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {categoryFormData?.name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Parent category:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {categoryFormData?.parent_category?.name || '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Created at:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                {categoryFormData?.created_at
                  ? moment(categoryFormData?.created_at)?.format('YYYY-MM-DD HH:mm')
                  : '-'}
              </dd>
            </div>
            <div className="p-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Updated at:</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">-</dd>
            </div>
          </dl>
        </div>
      </SlideOvers>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Category" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <Modal modalState={modalState} modalFn={handleModal} modalWidth={'w-full max-w-md'}>
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-black dark:text-white mb-5"
              >
                {isNew ? 'New' : 'Edit'} category
              </Dialog.Title>
              <form onSubmit={(e) => (isNew ? handleCategorySubmit(e) : handleCategoryUpdate(e))}>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                      <span className="text-red text-lg absolute left-0 top-0">*</span>
                      <span className="ml-3">Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Please enter"
                      value={categoryFormData.name}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'name') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke'}`}
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
                      <span className="ml-3">Parent Category</span>
                    </label>
                    <select
                      name="parent_id"
                      value={categoryFormData.parent_id}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${validationErrors?.issues.some((issue) => issue.path[0] === 'parent_id') ? 'focus:border-danger active:border-danger dark:focus:border-danger border-danger' : 'focus:border-primary active:border-primary dark:focus:border-primary border-stroke'}`}
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
                          .filter((error) => error.path[0] === 'parent_id')
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
                  setCategoryFormData(initialFormData);
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
              tableFn={handleGetCategory}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CategoryPage;
