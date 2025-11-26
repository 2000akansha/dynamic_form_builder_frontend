import React from 'react';

const ToggleButton = ({ show, setShow, label_1, label_2 }) => {
  return (
    <div className="relative flex items-center bg-gray-200 rounded-full p-0.5 min-w-40 overflow-hidden">
      {/* Left Button */}
      <button
        className={`relative z-10 text-sm flex-1 py-1 font-medium text-center rounded-full transition-all duration-300 ${
          show ? 'bg-amber-400 text-white' : 'text-gray-500'
        }`}
        onClick={() => setShow(true)}
      >
        {label_1}
      </button>

      {/* Right Button */}
      <button
        className={`relative z-10 text-sm flex-1 py-1 font-medium text-center rounded-full transition-all duration-300 ${
          !show ? 'bg-amber-400 text-white' : 'text-gray-500'
        }`}
        onClick={() => setShow(false)}
      >
        {label_2}
      </button>

      {/* Sliding Indicator */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-amber-400 rounded-full transition-transform duration-300 ease-in-out ${
          show ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
      ></div>
    </div>
  );
};

export default ToggleButton;
