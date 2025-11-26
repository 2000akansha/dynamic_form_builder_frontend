import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RxCross1 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import CONSTANTS from '../constants.json';
import { useDispatch } from 'react-redux';
import { updateStatus } from '../redux/apis/object';

const ActionModal = ({
  closeModal,
  type,
  id,
  currentStatus,
  setRecallApi,
  recallApi,
}) => {
  // Validation schema for Formik
  const validationSchema = Yup.object({
    status: Yup.string()
      .oneOf(['0', '1'], 'Invalid status selected')
      .required('Action is required'),
  });

  const initialValues = {
    status: currentStatus || '1',
  };

  const dispatch = useDispatch();

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = { type, id, status: values.status };
    dispatch(updateStatus(payload)).then((res) => {
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
          {type} {CONSTANTS.MODAL_HEADING.ACTION_MODAL}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Dropdown for Choose Action */}
              <div className="mb-5">
                <label
                  htmlFor="status"
                  className="block text-left text-sm font-medium leading-6 text-gray-700"
                >
                  {CONSTANTS.LABEL.CHANGE_STATUS}
                </label>
                <Field
                  as="select"
                  name="status"
                  className="custom-input text-xs uppercase text-gray-500 font-semibold"
                  placeholder="Select an action"
                >
                  <option value="1" label="ACTIVE" />
                  <option value="0" label="IN-ACTIVE" />
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-xs text-red-500 text-left mt-1"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-5 justify-between w-full">
                <div className="flex-1">
                  <button
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

export default ActionModal;
