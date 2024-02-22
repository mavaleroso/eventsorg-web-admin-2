'use client';

import { Metadata } from 'next';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState } from 'react';
import Table from '@/components/Table';
import { getUsers } from '@/services/users/api';
import Modal from '@/components/Modal';
import flatpickr from 'flatpickr';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
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

const UsersPage = () => {
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [selected, setSelected] = useState(cities[0]);
  const [query, setQuery] = useState('');
  const [formFilterData, setFormFilterData] = useState({
    field_name: '',
    name: '',
    viber_no: '',
    sorting: 'asc',
    language_code: 'en-US',
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
      index: 'first_name',
      render: (dom: any) => {
        return `<h5 class="font-medium text-black dark:text-white">
                  ${dom || '-'}
                </h5>`;
      },
    },
    {
      title: 'Viber number',
      index: 'viber_no',
      render: (dom: any) => {
        return `<h5 class="font-medium text-black dark:text-white">
                  ${dom || '-'}
                </h5>`;
      },
    },
    {
      title: 'Status',
      index: 'status',
      render: (dom: any) => {
        return `<h5 class="font-medium text-black dark:text-white">
                  ${dom || '-'}
                </h5>`;
      },
    },
    {
      title: 'Actions',
      index: 'id',
      render: (dom: any) => {
        return `<div class="flex items-center justify-end gap-1">
                <button class="bg-primary text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 xl:mr-1 lg:mr-1">
                    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                    <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                  </svg>
                  <span class="hidden xl:block lg:block">Edit</span>
                </button>
                <button class="bg-slate-400 text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 xl:mr-1 lg:mr-1">
                    <path d="M7.25 3.688a8.035 8.035 0 0 0-4.872-.523A.48.48 0 0 0 2 3.64v7.994c0 .345.342.588.679.512a6.02 6.02 0 0 1 4.571.81V3.688ZM8.75 12.956a6.02 6.02 0 0 1 4.571-.81c.337.075.679-.167.679-.512V3.64a.48.48 0 0 0-.378-.475 8.034 8.034 0 0 0-4.872.523v9.268Z" />
                  </svg>
                  <span class="hidden xl:block lg:block">View</span>
                </button>
                <button class="bg-danger text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 xl:mr-1 lg:mr-1">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                  <span class="hidden xl:block lg:block">Delete</span>
                </button>
                <button class="bg-black text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 xl:mr-1 lg:mr-1">
                    <path d="M4.75 4.25a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Z" />
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2H6a1.5 1.5 0 0 1 1.5 1.5V6A1.5 1.5 0 0 1 6 7.5H3.5A1.5 1.5 0 0 1 2 6V3.5Zm1.5 0H6V6H3.5V3.5Z" clipRule="evenodd" />
                    <path d="M4.25 11.25a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
                    <path fillRule="evenodd" d="M2 10a1.5 1.5 0 0 1 1.5-1.5H6A1.5 1.5 0 0 1 7.5 10v2.5A1.5 1.5 0 0 1 6 14H3.5A1.5 1.5 0 0 1 2 12.5V10Zm1.5 2.5V10H6v2.5H3.5Z" clipRule="evenodd" />
                    <path d="M11.25 4.25a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Z" />
                    <path fillRule="evenodd" d="M10 2a1.5 1.5 0 0 0-1.5 1.5V6A1.5 1.5 0 0 0 10 7.5h2.5A1.5 1.5 0 0 0 14 6V3.5A1.5 1.5 0 0 0 12.5 2H10Zm2.5 1.5H10V6h2.5V3.5Z" clipRule="evenodd" />
                    <path d="M8.5 9.417a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM8.5 13.083a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM13.083 8.5a.917.917 0 1 0 0 1.833.917.917 0 0 0 0-1.833ZM12.166 13.084a.917.917 0 1 1 1.833 0 .917.917 0 0 1-1.833 0ZM11.25 10.333a.917.917 0 1 0 0 1.833.917.917 0 0 0 0-1.833Z" />
                  </svg>
                  <span class="hidden xl:block lg:block text-nowrap">QR Code</span>
                </button>
              </div>`;
      },
    },
  ];

  useEffect(() => {
    handleGetUser(formFilterData);
    flatpickr('.form-datepicker', {
      mode: 'single',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'M j, Y',
      prevArrow:
        '<svg className="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow:
        '<svg className="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    });
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
      // if (error?.response?.status == 401) {
      // let res = await  outLogin()
      // message.error('UnAuthenticated.')
      // store.remove('accessToken');
      // history.push('/')

      // }
    }
    setLoading(false);
  };

  const handleFilterFormSumbmit = (e: any) => {
    e.preventDefault();
    const nonEmptyValues = Object.fromEntries(
      Object.entries(formFilterData).filter(([_, value]) => {
        // Check if value is a string, number, and non-empty
        return (
          (typeof value === 'string' && value.trim() !== '') ||
          (typeof value === 'number' && value !== 0)
        );
      }),
    );

    handleGetUser(nonEmptyValues);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormFilterData({
      ...formFilterData,
      [name]: value,
    });
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Users" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <Modal modalState={modalState} modalFn={handleModal} modalTitle={'New user'}>
              <form>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      First name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Middle name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Suffix
                    </label>
                    <input
                      type="text"
                      name="suffix"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Gender
                    </label>
                    <select
                      name="gender"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" className="text-opacity-65">
                        Please select
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Femal</option>
                      <option value="Rather not to say">Rather not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      name="Birthdate"
                      placeholder="Please enter"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Gender
                    </label>
                    <Combobox value={selected} onChange={setSelected}>
                      <div className="relative">
                        <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                          <Combobox.Input
                            className="w-full border-none pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                            displayValue={(city: any) => city.label}
                            onChange={(event) => {
                              setQuery(event.target.value);
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
                                  value={city.value}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
