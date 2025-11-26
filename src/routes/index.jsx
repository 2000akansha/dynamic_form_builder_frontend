import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CreateForm from '../pages/forms/CreateForm';
import CreateFormFields from '../pages/forms/CreateFormFields';
import FormListing from '../pages/forms/FormListing';
import UserForms from '../pages/forms/UserForms';
import FormBuilder from '../pages/forms/FormBuilder';
import PublicForm from '../pages/forms/PublicForm';
import AdminFormSubmissions from '../pages/forms/AdminFormSubmissions';
import AllSubmissions from '../pages/forms/AllSubmissions';
import SubmissionComparison from '../components/SubmissionComparison';
const PublicOutlet = lazy(() => import('./PublicOutlet'));
const PrivateOutlet = lazy(() => import('./PrivateOutlet'));
const HomePage = lazy(() => import('../pages/home/HomePage'));
const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const ResetPassword = lazy(() => import('../components/ResetPassword'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('../pages/notFound/NotFoundPage'));


const RouterComponent = () => {
  const { userRole, accessToken } =
    useSelector((state) => state.userDetailsSlice.details || {});

  const isAuthenticated = !!accessToken;

  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: "/",
        element: isAuthenticated ? (
          <Navigate to="/home/my-forms" replace />
        ) : (
          <Navigate to="/admin" replace />
        ),
      },
      // Public form submission route
      { path: "/form/:formId", element: <PublicForm /> },

      // Auth routes
      { path: "/admin", element: <PublicOutlet />, children: [{ path: "", element: <LoginPage /> }] },
      { path: "/reset-password", element: <PublicOutlet />, children: [{ path: "", element: <ResetPassword /> }] },

      {
        path: "/home",
        element: <PrivateOutlet />,
        children: [
          {
            element: <HomePage />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "my-forms", element: <FormListing isPrivate={true} /> },
              { path: "my-forms/:formId/submissions", element: <AdminFormSubmissions isPrivate={true} /> },
              { path: "my-forms/:formId/compare/:submissionId1/:submissionId2", element: <SubmissionComparison /> },
              { path: "responses", element: <AllSubmissions isPrivate={true} /> },
              { path: "forms", element: <UserForms isPrivate={true} /> },
              { path: "create-form", element: <FormBuilder isPrivate={true} /> },
              { path: "create-form-fields", element: <CreateFormFields isPrivate={true} /> },
              // Legacy redirects to keep old links working
              { path: "create-properties", element: <Navigate to="/home/create-form" replace /> },
              { path: "my-properties", element: <Navigate to="/home/my-forms" replace /> },
              { path: "all-bookings", element: <Navigate to="/home/my-forms" replace /> },
              { path: "my-bookings", element: <Navigate to="/home/my-forms" replace /> },
            ],
          },
        ],
      },
      // Direct admin routes (optional duplication of above)
      { path: "/admin/forms/create", element: <CreateForm /> },
      { path: "/admin/forms/create-fields", element: <CreateFormFields /> },

      { path: "*", element: <NotFoundPage /> },
    ]);
  }, [userRole, accessToken]);

  return router;
};

export default RouterComponent;

