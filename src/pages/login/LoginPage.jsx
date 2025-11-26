import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../redux/apis/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import CONSTANTS from '../../constants.json';
import Underline from '../../components/Underline';
import TroubleLogin from '../../components/TroubleLogin';
import Cookies from "js-cookie";
import ReCAPTCHA from "react-google-recaptcha"; // ✅ import captcha

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toastId, setToastId] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
 const [captchaToken, setCaptchaToken] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    role: Yup.string().required("Role is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialValues = {
    role: "0",
    username: "",
    password: "",
  };

const handleSubmit = (values, { setSubmitting }) => {
  if (!captchaToken) {
      toast.error("Please complete the CAPTCHA first");
      setSubmitting(false);
      return;
    }
  //

  dispatch(userLogin({ ...values ,captchaToken})).then((res) => {
    if (res.success) {
      if (toastId) toast.dismiss(toastId);

      // Full page reload to /home/my-properties
      setTimeout(() => {
        window.location.href = "/home/my-properties"; // ✅ Full page load
      }, 99999999999); // slight delay optional

    } else {
      if (toastId) toast.dismiss(toastId);
      const id = toast.error(res.message || "Login failed");
      setToastId(id);
    }

    setSubmitting(false);
  });
};


  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };


return (
  <div className="w-full h-screen overflow-y-scroll hide-scrollbar flex justify-evenly items-center flex-col sm:flex-row gap-2 p-2 relative">

    {/* 🌿 Realistic 3D Background */}
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#264653] via-[#2c5968] to-[#264658]">
      {/* Radial spotlight top-left */}
      <div className="absolute w-[40rem] h-[40rem] bg-gradient-radial from-[#71B3CE]/50 to-transparent opacity-70 rounded-full blur-[150px] -top-40 -left-40"></div>

      {/* Radial spotlight bottom-right */}
      <div className="absolute w-[35rem] h-[35rem] bg-gradient-radial from-[#71B3CE]/40 to-transparent opacity-60 rounded-full blur-[140px] -bottom-32 -right-32"></div>

      {/* Ambient glow center */}
      <div className="absolute w-[25rem] h-[25rem] bg-gradient-radial from-white/10 to-transparent opacity-30 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      {/* Subtle noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')" }}
      ></div>
    </div>

    {/* Overlay pattern (if needed, else remove) */}
    <div className="absolute inset-0 bg-cover bg-center opacity-55" style={{ mixBlendMode: "overlay" }}></div>

    {/* 🌟 Logo & Title */}
    <div className="relative z-10 flex flex-col justify-center items-center gap-5 p-3 m-1">
      {/* Glassmorphic Logo Container */}
      <div className="bg-white/25 backdrop-blur-lg shadow-2xl p-6 rounded-3xl border border-white/20">
        <img src="/dfb.png" alt="logo" width="550" className="rounded-lg drop-shadow-xl" />
      </div>
      <div className="text-white font-semibold text-3xl max-w-xl text-center uppercase drop-shadow-lg">
        {CONSTANTS.LOGIN_PAGE_PROJECT_NAME}
      </div>
       <div className="text-white font-semibold text-sm max-w-xl text-center uppercase drop-shadow-lg">
          {CONSTANTS.SDA_ADDRESS}
        </div>
    </div>

    {/* 🌟 Login Card */}
    <div className="m-1 loginPage px-8 max-w-md rounded-2xl shadow-2xl bg-white/40 backdrop-blur-lg border border-white/20 self-center text-center w-[300px] sm:w-[350px] md:w-[380px] lg:w-[380px] relative z-10">
      <h3 className="my-8 text-gray-700 font-bold uppercase">{CONSTANTS.PAGE.SIGN_IN}</h3>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mb-8">
            {/* Username Field */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-left text-sm font-medium text-gray-900">
                {CONSTANTS.LABEL.USERNAME}
              </label>
              <Field
                type="text"
                name="username"
                className="custom-input bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg"
                placeholder="Enter username"
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
              />
              <ErrorMessage name="username" component="div" className="text-xs text-red-500 text-left" />
            </div>

            {/* Password Field */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-left text-sm font-medium text-gray-900">
                {CONSTANTS.LABEL.PASSWORD}
              </label>
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                className="custom-input bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg"
                placeholder="Enter password"
              />
              <ErrorMessage name="password" component="div" className="text-xs text-red-500 text-left" />
              <span
                className="absolute inset-y-0 right-3 top-6 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-600" />
              </span>
            </div>
 {/* ✅ reCAPTCHA */}
              <div className="mb-4 flex justify-center">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white py-2 px-4 w-full rounded-lg shadow-lg hover:bg-primary2 transition-all duration-300"
            >
              {isSubmitting ? "Logging In..." : CONSTANTS.BUTTON.LOGIN}
            </button>
          </Form>
        )}
      </Formik>
    </div>

    <Toaster />

    {isForgotModalOpen && (
      <TroubleLogin closeModal={() => setIsForgotModalOpen(false)} />
    )}
  </div>
);



};



export default LoginPage;
