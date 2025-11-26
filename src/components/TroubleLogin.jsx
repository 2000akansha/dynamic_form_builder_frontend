import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import CONSTANTS from '../constants.json';
import { sendLink } from '../redux/apis/auth';
import { useDispatch } from 'react-redux';

const TroubleLogin = ({ closeModal }) => {
  const dispatch = useDispatch();
  const [emailSent, setEmailSent] = useState(false);

  const validationSchema = Yup.object({
    emailOrUsername: Yup.string()
      .required('Email or username is required')
      .test(
        'emailOrUsername',
        'Enter a valid email or username',
        (value) =>
          /^[0-9]{8}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ),
  });

  const initialValues = {
    emailOrUsername: '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(sendLink(values)).then((res) => {
      if (res.success) {
        toast.success(
          'A password reset link has been sent successfully. Please check your email and follow the instructions to reset your password.'
        );
        closeModal();
      } else {
        toast.error(res.message);
      }
      setSubmitting(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="m-4 bg-white p-6 rounded-lg shadow-lg w-[300px] sm:w-[350px] md:w-[380px] lg:w-[380px] text-center relative">
        <button
          className="text-gray-500 hover:text-gray-800 absolute top-3 right-3 text-lg"
          onClick={closeModal}
        >
          <RxCross1 />
        </button>
        <h3 className="mt-4 mb-4 text-gray-600 font-semibold">
          {CONSTANTS.MODAL_HEADING.TROUBLE_LOGIN}
        </h3>
        <p className="mb-6 text-sm text-gray-500">
          {CONSTANTS.LABEL.ENTER_EMAIL_OR_USERNAME}
        </p>

        {emailSent ? (
          <p className="text-green-500 text-sm">
            Check your email for the reset link.
          </p>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Email / Username Input */}
                <div className="mb-3">
                  <Field
                    type="text"
                    name="emailOrUsername"
                    className="custom-input"
                    placeholder="Enter email or username"
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/\s/g, ''))
                    }
                  />
                  <ErrorMessage
                    name="emailOrUsername"
                    component="div"
                    className="text-xs text-red-500 text-left mt-1"
                  />
                </div>

                <div className="flex gap-5 justify-between w-full pt-3">
                  <div className="w-2/5">
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full"
                      onClick={closeModal}
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
                      {isSubmitting ? 'Sending...' : CONSTANTS.BUTTON.SEND_LINK}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default TroubleLogin;
