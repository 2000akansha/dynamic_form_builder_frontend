import { useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate(); // Use the navigate hook

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-bold mb-4">Login Required</h2>
        <p className="mb-6">Please login to book a property.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/CustomerLoginPage'); // Use navigate to redirect
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
