import React, { useEffect, useState, useRef } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { RxCross1 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
// import { guaranteesAlerts } from '../redux/apis/guarantee.js';
import moment from 'moment';
import {
  HiMiniExclamationCircle,
  HiMiniExclamationTriangle,
  HiMiniShieldExclamation,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import CONSTANTS from '../constants.json';

const AlertButton = () => {
  const [alerts, setAlerts] = useState([]);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const setExpiryColor = (days) => {
    if (days < 0) {
      return (
        <div className="flex items-center gap-1 text-xs">
          <span className=" uppercase text-red-600">Expired</span>
        </div>
      );
    } else if (days <= 30 && days > 20) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-amber-400">
            <HiMiniExclamationCircle size={16} />
          </span>
          <span>{days} days</span>
        </div>
      );
    } else if (days <= 20 && days > 10) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-orange-400">
            <HiMiniExclamationTriangle size={16} />
          </span>
          <span>{days} days</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <span className="text-rose-400">
            <HiMiniShieldExclamation size={16} />
          </span>
          <span>{days} days</span>
        </div>
      );
    }
  };

  // const fetchAlerts = () => {
  //   dispatch(guaranteesAlerts()).then((res) => {
  //     if (res.success) {
  //       setAlerts(res.alerts);
  //     } else {
  //       toast.error(res.message);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   fetchAlerts();
  // }, [dispatch]);

  const openAlertsModal = (e) => {
    const rect = e.target.getBoundingClientRect();

    const left = Math.min(rect.left + window.scrollX, window.innerWidth - 400);
    const top = Math.min(
      rect.bottom + window.scrollY + 10,
      window.innerHeight - 300
    );

    setModalPosition({ top, left });
    setIsAlertsModalOpen(true);
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsAlertsModalOpen(false);
      }
    };

    if (isAlertsModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAlertsModalOpen]);

  return (
    <div>
      <div
        className="text-white hover:text-stone-200 cursor-pointer relative"
        onClick={(e) => {
          openAlertsModal(e);
          fetchAlerts();
        }}
      >
        <LuCalendarClock size={28} />
        {/* {alerts?.length > 0 && (
          <div className="absolute bg-rose-500 w-3 h-3 rounded-full top-[-3px] right-[-3px]"></div>
        )} */}
      </div>
      {/* Alert Modal */}
      {isAlertsModalOpen && (
        <div
          ref={modalRef}
          style={{
            position: 'absolute',
            top: modalPosition.top,
            left: modalPosition.left,
            zIndex: 20,
            maxWidth: '400px',
            minWidth: '300px',
          }}
          className="bg-white shadow-2xl rounded-md p-4 border overflow-hidden"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-600 font-semibold uppercase text-sm flex items-center gap-1">
              Guarantees near expiry or expired
              {alerts?.length > 0 && (
                <div
                  className={`flex items-center justify-center rounded-full bg-red-400 text-white ${alerts?.length > 99 ? 'text-[8px]' : 'text-[10px]'
                    } font-bold w-4 h-4`}
                >
                  {alerts?.length > 99 ? '99+' : alerts?.length}
                </div>
              )}
            </div>
            <button
              className="text-gray-500 hover:text-gray-800 text-lg"
              onClick={() => setIsAlertsModalOpen(false)}
            >
              <RxCross1 size={16} />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-medium text-gray-600">
                  <th className="px-4 py-2">Guarantee No.</th>
                  <th className="px-4 py-2">Validity</th>
                  <th className="px-4 py-2">Expiring In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alerts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-5 text-xs font-semibold text-gray-500"
                    >
                      {CONSTANTS.NO_ALERTS}
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert, index) => (
                    <tr key={index} className="text-xs bg-white text-gray-500">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="max-w-28 overflow-auto whitespace-nowrap p-2 custom-scrollbar">
                          <Link
                            className="font-medium hover:text-gray-600"
                            to={`/guarantees/guarantee-details?guaranteeId=${alert._id}`}
                            onClick={() => setIsAlertsModalOpen(false)}
                          >
                            {alert.bankGuaranteeNumber}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {moment(alert.validity).format('DD MMM YYYY')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {setExpiryColor(alert.expiringIn)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertButton;
