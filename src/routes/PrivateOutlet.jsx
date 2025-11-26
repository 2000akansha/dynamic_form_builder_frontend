// // import { Navigate, Outlet } from 'react-router-dom';
// // import Cookies from 'js-cookie';
// // import { useSelector } from 'react-redux';

// // const PrivateOutlet = () => {
// //   const user = useSelector((state) => state.userDetailsSlice.details);
// //   if (!user) {
// //     Cookies.remove('accessToken');
// //   }
// //   const isAuthenticated = Cookies.get('accessToken');
// //   return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" />;
// // };

// // export default PrivateOutlet;
// import { Navigate, Outlet } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { useSelector } from 'react-redux';

// const PrivateOutlet = () => {
//   const user = useSelector((state) => state.userDetailsSlice.details);
//   const isAuthenticated = Cookies.get('accessToken');

//   // Optional cleanup — only remove token if you’re sure it's invalid
//   if (!isAuthenticated || !user) {
//     Cookies.remove('accessToken'); // optional
//     return <Navigate to="/index" replace />;
//   }

//   return <Outlet />;
// };

// export default PrivateOutlet;

import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateOutlet = () => {
  // ✅ Prefer Redux state for accessToken
  const accessToken = useSelector(
    (state) => state.userDetailsSlice?.details?.accessToken
  );

  // If no token, redirect to login
  if (!accessToken) {
    return <Navigate to="/admin" replace />;
  }

  // Token exists → allow access
  return <Outlet />;
};

export default PrivateOutlet;
