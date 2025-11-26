
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import CONSTANTS from '../constants.json';
import {
  FaFileLines,
  FaFile,
} from 'react-icons/fa6';
import { AiFillProduct } from 'react-icons/ai';


  const Sidebar = ({ toggleSidebar }) => {
    const { pathname } = useLocation();
    const { userRole } = useSelector((state) => state.userDetailsSlice.details);

    const isPathActive = (paths) => paths.some((p) => pathname.includes(p));

    const getMenuItems = () => [
      // Forms listing
      {
        to: "/home/my-forms",
        paths: ["/home/my-forms"],
        label: CONSTANTS.SIDEBAR.FORM_LISTING,
        icon: FaFileLines,
        show: true,
      },
      // Responses (highlights when on any submissions route)
      // {
      //   to: "/home/responses",
      //   paths: ["/home/responses", "/submissions"],
      //   label: "Responses",
      //   icon: FaFileLines,
      //   show: true,
      // },
      // Create form
      {
        to: "/home/create-form",
        paths: ["/home/create-form"],
        label: CONSTANTS.SIDEBAR.CREATE_FORM,
        icon: FaFile,
        show: true,
      },
      // Add fields
      // {
      //   to: "/home/create-form-fields",
      //   paths: ["/home/create-form-fields"],
      //   label: CONSTANTS.SIDEBAR.CREATE_FORM_FIELDS,
      //   icon: FaFile,
      //   show: true,
      // },
    ];

    return (
      <div className="m-0 py-4 px-3 flex flex-col h-full justify-between">
        <div className="flex flex-col gap-3 justify-center">
          {getMenuItems()
            .filter((item) => item.show)
            .map(({ to, paths, label, icon: Icon }, index) => {
              const isActive = isPathActive(paths);
              const activeClass = isActive ? "bg-primary text-white" : "hover:bg-gray-100";

              return (
                <NavLink
                  key={index}
                  to={to}
                  className={`block rounded-md py-2 ${activeClass} ${toggleSidebar ? "px-1" : "px-4"}`}
                >
                  <div className={`flex items-center gap-2 ${toggleSidebar ? "justify-center" : ""}`}>
                    <Icon className={`text-lg ${isActive ? "text-white" : "text-primary"}`} />
                    <div className={`${toggleSidebar ? "hidden" : "block"} transition-all duration-300`}>
                      {label}
                    </div>
                  </div>
                </NavLink>
              );
            })}
        </div>
      </div>
    );
  };

export default Sidebar;
