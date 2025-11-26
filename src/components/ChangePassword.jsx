import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RxCross1 } from 'react-icons/rx';
import { changePassword } from '../redux/apis/auth';
import { removeUserDetails } from '../redux/slices/userDetailsSlice';
import CONSTANTS from '../constants.json';

const ChangePassword = ({ closeModal }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      )
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(changePassword(values)).then((res) => {
      if (res.status) {
        toast.success(
          'Password updated successfully. You will be logged out in few seconds.'
        );
        closeModal();
        setTimeout(() => {
          Cookies.remove('accessToken');
          dispatch(removeUserDetails());
          navigate('/');
        }, 2000);
      } else {
        toast.error(res.message);
      }
      setSubmitting(false);
    });
  };

  const togglePasswordVisibility = (type) => {
    if (type === 'current') setShowCurrentPassword(!showCurrentPassword);
    if (type === 'new') setShowNewPassword(!showNewPassword);
    if (type === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="m-4 bg-white p-6 rounded-lg shadow-lg w-[300px] sm:w-[350px] md:w-[380px] lg:w-[380px] text-center relative">
        <button
          className="text-gray-500 hover:text-gray-800 absolute top-3 right-3 text-lg"
          onClick={() => closeModal()}
        >
          <RxCross1 />
        </button>
        <h3 className="mt-4 mb-6 text-gray-600 font-semibold">
          {CONSTANTS.MODAL_HEADING.CHANGE_PASSWORD}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched }) => (
            <Form>
              {/* Current Password */}
              <div className="mb-3">
                <div className="relative">
                  <label
                    htmlFor="currentPassword"
                    className="block text-left text-sm font-medium leading-6 text-gray-700"
                  >
                    {CONSTANTS.LABEL.CURRENT_PASSWORD}
                  </label>
                  <Field
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    className="custom-input"
                    placeholder="Enter current password"
                  />
                  <span
                    className="absolute inset-y-0 right-3 top-6 flex items-center cursor-pointer"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    <FontAwesomeIcon
                      icon={showCurrentPassword ? faEyeSlash : faEye}
                      className="text-gray-600"
                    />
                  </span>
                </div>
                <ErrorMessage
                  name="currentPassword"
                  component="div"
                  className="text-xs text-red-500 text-left"
                />
              </div>

              {/* New Password */}
              <div className="mb-3">
                <div className="relative">
                  <label
                    htmlFor="newPassword"
                    className="block text-left text-sm font-medium leading-6 text-gray-700"
                  >
                    {CONSTANTS.LABEL.NEW_PASSWORD}
                  </label>
                  <Field
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    className="custom-input"
                    placeholder="Enter new password"
                    onFocus={() => {
                      touched.newPassword = true;
                    }}
                  />
                  <span
                    className="absolute inset-y-0 right-3 top-6 flex items-center cursor-pointer"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEyeSlash : faEye}
                      className="text-gray-600"
                    />
                  </span>
                </div>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-xs text-red-500 text-left"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="custom-input"
                    placeholder="Confirm new password"
                    onFocus={() => {
                      touched.confirmPassword = true;
                    }}
                  />
                  <span
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                      className="text-gray-600"
                    />
                  </span>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-xs text-red-500 text-left"
                />
              </div>

              <div className="flex gap-5 justify-between w-full pt-3">
                <div className="w-2/5">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600  w-full"
                    onClick={() => closeModal()}
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
                    {isSubmitting
                      ? 'Changing...'
                      : CONSTANTS.BUTTON.CHANGE_PASSWORD}
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

export default ChangePassword;
