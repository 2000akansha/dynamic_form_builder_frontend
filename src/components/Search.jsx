// import React from 'react';
// import { Formik, Form, Field } from 'formik';

// const Search = ({ searchInput, onSearch }) => {
//   return (
//     <Formik
//       initialValues={{ search: searchInput }}
//       enableReinitialize
//       validate={(values) => {
//         const errors = {};
//         if (!values.search) {
//           errors.search = 'Required';
//         }
//         return errors;
//       }}
//       onSubmit={(values, { setSubmitting }) => {
//         onSearch(values.search);
//         setSubmitting(false);
//       }}
//     >
//       {({ values, isSubmitting }) => (
//         <Form className="flex items-center space-x-4 p-4 bg-gray-100 rounded-md shadow-sm">
//           <Field
//             type="text"
//             name="search"
//             placeholder="Search by Unique ID"
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
//             onInput={(e) => {
//               e.target.value = e.target.value.replace(/\s+/g, ' ');
//             }}
//           />
//           <button
//             type="submit"
//             disabled={!values.search || isSubmitting}
//             className={`px-6 py-2 font-semibold text-white rounded-md ${!values.search || isSubmitting
//               ? 'bg-gray-300 cursor-not-allowed'
//               : 'bg-blue-500 hover:bg-blue-600'
//               }`}
//           >
//             {isSubmitting ? 'Searching...' : 'Search'}
//           </button>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default Search;










// src/components/SearchFilterModal.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik'; // Import Formik components
import { IoClose } from 'react-icons/io5';
import { IoFilter } from 'react-icons/io5'; // Keeping filter icon for aesthetic

const SearchFilterModal = ({
  isOpen,
  onClose,
  currentSearchInput,
  currentSearchColumns,
  availableColumns, // Array of { key: 'columnKey', label: 'Column Label' }
  onApplyFilters, // This will handle applying both search term and selected columns
  onClearAllFilters // For clearing search and selected columns from within the modal
}) => {
  // No need for local state for searchInput/selectedColumns if Formik handles it
  // But we need to use them to initialize Formik's state.

  if (!isOpen) return null;

  const initialValues = {
    search: currentSearchInput || '',
    selectedColumns: currentSearchColumns || [], // Use current value for initial state
  };

  const handleColumnChange = (e, setFieldValue) => {
    const { value, checked } = e.target;
    setFieldValue('selectedColumns', checked
      ? [...initialValues.selectedColumns, value] // Add to array if checked
      : initialValues.selectedColumns.filter(col => col !== value) // Remove from array if unchecked
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-gray-900 bg-opacity-50">
      <div className="relative w-auto my-6 mx-auto max-w-lg min-w-[300px] md:min-w-[400px]">
        {/* Modal content */}
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IoFilter size={20} /> Search & Filter Listings
            </h3>
            <button
              className="p-1 ml-auto border-0 text-gray-500 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <IoClose className="text-gray-500" size={24} />
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            enableReinitialize={true} // Important to re-initialize if props change
            validate={(values) => {
              const errors = {};
              // You can add validation logic here if needed
              // For example, require search input if columns are selected, or vice-versa
              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              // Call the onApplyFilters prop from ListingsPage
              onApplyFilters(values.search, values.selectedColumns);
              setSubmitting(false);
              onClose(); // Close modal after applying filters
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                {/* Body */}
                <div className="relative p-6 flex-auto">
                  <div className="mb-4">
                    <label htmlFor="search-input" className="block text-gray-700 text-sm font-bold mb-2">
                      Search Keyword:
                    </label>
                    <Field
                      type="text"
                      name="search"
                      id="search-input"
                      placeholder="Enter search term..."
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\s+/g, ' ');
                      }}
                    />
                    {/* You can add error message here if Formik validation is used for 'search' field */}
                    {/* <ErrorMessage name="search" component="div" className="text-red-500 text-xs mt-1" /> */}
                  </div>

                  <div className="mb-4">
                    <h4 className="block text-gray-700 text-sm font-bold mb-2">
                      Search In Columns:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar border p-2 rounded">
                      {availableColumns
                        .filter(col => typeof col.key === 'string' && col.key !== '' && !['createdAt', 'settlementDate', 'paymentInstructionDate'].includes(col.key))
                        .map(col => (
                          <div key={col.key} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`col-${col.key}`}
                              name="selectedColumns" // Important: name must match the Formik field name
                              value={col.key} // Value of the checkbox
                              checked={values.selectedColumns.includes(col.key)} // Check if column is in selectedColumns array
                              onChange={(e) => handleColumnChange(e, setFieldValue)} // Custom handler to update Formik field
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <label htmlFor={`col-${col.key}`} className="ml-2 text-gray-700 text-sm">
                              {col.label}
                            </label>
                          </div>
                        ))}
                      {availableColumns.length === 0 && (
                        <p className="text-sm text-gray-500 col-span-2">No columns available for filtering.</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b gap-3">
                  <button
                    className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      onClearAllFilters(); // Call the prop to clear filters on the main page
                      onClose(); // Close modal after clearing
                    }}
                  >
                    Clear Search & Filters
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 font-bold uppercase text-sm rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 ${isSubmitting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white active:bg-blue-600'
                      }`}
                  >
                    {isSubmitting ? 'Applying...' : 'Apply Filters'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterModal;