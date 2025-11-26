import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RxCross1 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import CONSTANTS from '../constants.json';
import { useDispatch } from 'react-redux';
import { newObject } from '../redux/apis/object';

const AddObject = ({ closeModal, type, parentId, recallApi, setRecallApi }) => {
  const dispatch = useDispatch();

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(150, 'Name cannot exceed 150 characters')
      .required('Name is required'),
    address: Yup.lazy(() => {
      if (type === 'branch') {
        return Yup.string()
          .trim()
          .min(2, 'Address must be at least 2 characters')
          .max(150, 'Address cannot exceed 150 characters')
          .required('Address is required for branches');
      } else {
        return Yup.string().notRequired();
      }
    }),
    parentId: Yup.lazy(() => {
      if (type === 'circle' || type === 'branch') {
        return Yup.string()
          .matches(/^[0-9a-fA-F]{24}$/, 'Invalid parentId format')
          .required('Parent ID is required for circles and branches');
      } else {
        return Yup.string().notRequired();
      }
    }),
  });

  const initialValues = {
    name: '',
    address: '',
    type: type,
    parentId: parentId || '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = { ...values };
    if (values.type === 'zone' || values.type === 'bank') {
      delete payload.parentId;
      delete payload.address;
    }
    if (values.type === 'circle') {
      delete payload.address;
    }
    dispatch(newObject(payload)).then((res) => {
      if (res.success) {
        toast.success(res.message);
        setRecallApi(!recallApi);
        closeModal();
      } else {
        toast.error(res.message);
      }
      setSubmitting(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="m-4 bg-white p-6 rounded-lg shadow-lg w-[300px] sm:w-[350px] md:w-[380px] lg:w-[400px] text-center relative">
        <button
          className="text-gray-500 hover:text-gray-800 absolute top-3 right-3 text-lg"
          onClick={closeModal}
        >
          <RxCross1 />
        </button>
        <h3 className="mt-4 mb-6 text-gray-600 font-semibold uppercase">
          ADD {type}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched }) => (
            <Form>
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-left text-sm font-medium leading-6 text-gray-700 capitalize"
                >
                  <span style={{ color: 'red' }}>*</span> {type}{' '}
                  {CONSTANTS.LABEL.NAME}
                </label>
                <Field
                  type="text"
                  name="name"
                  className="custom-input"
                  placeholder="Enter name"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\s+/g, ' ');
                  }}
                  onFocus={() => {
                    touched.name = true;
                  }}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-xs text-red-500 text-left mt-1"
                />
              </div>

              {/* Address Field (only for branch) */}
              {type === 'branch' && (
                <div className="mt-3">
                  <label
                    htmlFor="address"
                    className="block text-left text-sm font-medium leading-6 text-gray-700"
                  >
                    <span style={{ color: 'red' }}>*</span>{' '}
                    {CONSTANTS.LABEL.BRANCH_ADDRESS}
                  </label>
                  <Field
                    type="text"
                    name="address"
                    className="custom-input"
                    placeholder="Enter address"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\s+/g, ' ');
                    }}
                    onFocus={() => {
                      touched.address = true;
                    }}
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-xs text-red-500 text-left mt-1"
                  />
                </div>
              )}

              <div className="flex gap-5 justify-between w-full mt-8">
                <div className="flex-1">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full"
                    onClick={closeModal}
                    type="button"
                  >
                    {CONSTANTS.BUTTON.BACK}
                  </button>
                </div>
                <div className="flex-1">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : CONSTANTS.BUTTON.SAVE}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddObject;
