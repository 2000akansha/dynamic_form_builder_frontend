import React, { useState } from 'react';
import CONSTANTS from '../constants.json';
import ChangePassword from './ChangePassword';
import AlertButton from './AlertButton.jsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const HeaderWithLoginSignUpButton = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { userRole } = useSelector((state) => state.userDetailsSlice.details || {});
  const navigate = useNavigate();
    // const token = Cookies.get("accessToken");  // ✅ correct


    const { accessToken } = useSelector(
  (state) => state.userDetailsSlice.details || {}
);
const token = accessToken; // ✅ now `token` is from Redux
  return (
    <div className="flex justify-between items-center gap-5 px-8 py-3 bg-primary2">
           <div className="flex gap-2">
       <div className="border border-secondary rounded-full flex justify-center items-center w-12 h-12 overflow-hidden">
  <img
    src="/sda_logo.jpg"
    // alt="logo"
    className="w-full h-full object-cover"
  />
</div>

        <div className="text-white font-semibold text-md max-w-[350px] flex justify-center items-center text-center">
          {CONSTANTS.PROJECT_NAME}
        </div>
      </div>

      <div className="flex gap-5 items-center">
        {/* If authenticated, show alert and dropdown. Else, show login/signup buttons */}
        {token ? (
          <>
            {(userRole === '0' || userRole === '3') && <AlertButton />}
            {/* You can add NotificationButton here if needed */}
            {/* <NotificationButton /> */}
          </>
        ) : (
          <div className="flex gap-3">
            {/* <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold transition transform hover:scale-105 hover:shadow-lg"
            >
              Login as ADMIN
            </button> */}
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold transition transform hover:scale-105 hover:shadow-lg"
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {isModalOpen && <ChangePassword closeModal={() => setModalOpen(false)} />}
    </div>
  );
};

export default HeaderWithLoginSignUpButton;
