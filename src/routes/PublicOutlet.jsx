// // import { Navigate, Outlet, useLocation } from 'react-router-dom';
// // import Cookies from 'js-cookie';

// // const PublicOutlet = () => {
// //   const isAuthenticated = Cookies.get('accessToken');
// //   const location = useLocation();

// //   // Allow reset password page even if authenticated
// //   const isResetPasswordRoute = location.pathname.startsWith('/reset-password');

// //   return isAuthenticated && !isResetPasswordRoute ? (
// //     <Navigate to="/properties" />
// //   ) : (
// //     <Outlet />
// //   );
// // };

// // export default PublicOutlet;





// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import Cookies from "js-cookie";
// import { useSelector } from "react-redux";

// const PublicOutlet = () => {
//   const location = useLocation();

//   // ✅ Prefer Redux token, fallback to cookie
//   const tokenFromRedux = useSelector((state) => state.userDetailsSlice?.details?.accessToken);
//   const tokenFromCookie = Cookies.get("accessToken");
//   const isAuthenticated = tokenFromRedux || tokenFromCookie;

//   // ✅ Allow reset-password even if logged in
//   const isResetPasswordRoute = location.pathname.startsWith("/reset-password");

//   return isAuthenticated && !isResetPasswordRoute ? (
//     <Navigate to="/home/my-properties" replace />
//   ) : (
//     <Outlet />
//   );
// };

// export default PublicOutlet;



import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicOutlet = () => {
  const location = useLocation();

  // ✅ Prefer Redux token
  const accessToken = useSelector(
    (state) => state.userDetailsSlice?.details?.accessToken
  );

  // Allow reset-password page even if authenticated
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password');

  // If logged in and not on reset-password → redirect to home
  if (accessToken && !isResetPasswordRoute) {
    return <Navigate to="/home/my-properties" replace />;
  }

  return <Outlet />;
};

export default PublicOutlet;
