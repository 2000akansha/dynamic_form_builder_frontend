


import React, { useState, useEffect, useRef } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import CONSTANTS from '../constants.json';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setUserRole } from '../utils/setUserRole';
import { userLogout } from '../redux/apis/auth';

const HeaderDropdown = ({ setModalOpen }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userRole, name } = useSelector(
    (state) => state.userDetailsSlice.details
  );

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = async () => {
    try {
      const res = await dispatch(userLogout());


      if (res?.success) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        navigate("/index");
      } else {
      }
    } catch (err) {
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
    >
      <div className="inline-flex items-center justify-center w-full rounded-md px-4 py-2 bg-white text-sm font-medium shadow-md">
        <div className="flex gap-3 items-center text-gray-600">
          <span className="text-md font-semibold text-primary">{name}</span>-
          <div className="border border-gray-300 h-4"></div>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
            onClick={toggleDropdown}
          >
            <IoMdSettings size={18} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition duration-200 ease-in-out transform">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {userRole != "2" && (
              <div
                className="block cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition duration-150"
                role="menuitem"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                {CONSTANTS.BUTTON.CHANGE_PASSWORD}
              </div>
            )}
            <div
              className="block cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition duration-150"
              role="menuitem"
              onClick={handleLogoutClick}
            >
              {CONSTANTS.BUTTON.LOGOUT}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderDropdown;
