import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const BackButton = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div
      onClick={goBack}
      className="flex items-center cursor-pointer text-gray-500 hover:text-gray-600 transition-colors duration-200"
    >
      <IoArrowBack size={24} />
    </div>
  );
};

export default BackButton;
