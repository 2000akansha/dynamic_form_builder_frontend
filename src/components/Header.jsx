import React, { useState } from 'react';
import CONSTANTS from '../constants.json';
import HeaderDropdown from './HeaderDropdown';
import ChangePassword from './ChangePassword';
import AlertButton from './AlertButton.jsx';
import { useSelector } from 'react-redux';


const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { userRole, name } = useSelector((state) => state.userDetailsSlice.details);

  return (
    <div className="flex justify-between items-center gap-5 px-8 py-3 bg-primary2">
      <div className="flex gap-2">
        <div className="border border-secondary rounded-full flex justify-center items-center w-12 h-12 overflow-hidden">
          <img src="/dfb.png" className="w-full h-full object-cover" />
        </div>
        <div className="text-white font-semibold text-md max-w-[300px] flex justify-center items-center text-center">
          { CONSTANTS.PROJECT_NAME}
        </div>
      </div>

      {/* Alert / Notification */}
      <div className="flex gap-5 items-center">
        {/* {(userRole === "0" || userRole === "3") && (
          // <NotificationButton />
          <span className="text-white">🔔 Notifications</span>
        )} */}
        <HeaderDropdown setModalOpen={setModalOpen} />
      </div>

      {/* Change Password Modal */}
      {isModalOpen && <ChangePassword closeModal={() => setModalOpen(false)} />}
    </div>
  );
};

export default Header;






