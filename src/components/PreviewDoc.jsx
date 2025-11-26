import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RxCross1 } from 'react-icons/rx';
import { Link } from 'react-router-dom';

const PreviewDoc = ({ file, setShowFile }) => {
  const [toastId, setToastId] = useState(null);

  useEffect(() => {
    if (!file) {
      if (toastId) toast.dismiss(toastId);
      const id = toast.error('No file found!');
      setToastId(id);
      setShowFile(false);
    }
  }, [file, toastId, setShowFile]);

  if (!file) return null;

  const fileExtension = file.split('.').pop().toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension);

  // Check if the file is base64 content for a PDF
  const isBase64PDF = file.startsWith('/') || file.startsWith('JVBER'); // Base64 PDF often starts with '/' or '%PDF'

  // Prepend the base64 prefix if it's a base64 PDF
  const base64PDF = isBase64PDF ? `data:application/pdf;base64,${file}` : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 m-4 md:m-8">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition duration-200"
          onClick={() => setShowFile(false)}
        >
          <RxCross1 size={20} />
        </button>

        {/* Content */}
        {isImage ? (
          <div className="flex flex-col items-center">
            <Link
              to={file}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={file}
                alt="attachment"
                className="w-full max-w-md rounded-lg shadow-md transition duration-300 transform hover:scale-105"
              />
            </Link>
          </div>
        ) : (
          <iframe
            src={base64PDF ? base64PDF : file}
            title="Document Preview"
            className="w-full h-[500px] md:h-[600px] border border-gray-300 rounded-lg"
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

PreviewDoc.propTypes = {
  file: PropTypes.string,
  setShowFile: PropTypes.func.isRequired,
};

export default PreviewDoc;
