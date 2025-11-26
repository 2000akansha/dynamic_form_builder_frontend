import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userLogin } from '../../redux/apis/auth';
import toast, { Toaster } from 'react-hot-toast';
import CONSTANTS from '../../constants.json';
import { sendOtp, sendOtp_login, verifyOtp } from '../../redux/apis/OTP';
import { updateUserDetails } from '../../redux/slices/userDetailsSlice';
import Cookies from "js-cookie";



const CustomerLoginPage = () => {
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    contact: Yup.string()
      .required("Mobile number is required")
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
    otp: Yup.string().when("contact", {
      is: () => otpSent,
      then: (schema) =>
        schema.required("OTP is required").length(6, "OTP must be 6 digits"),
    }),
  });

  const initialValues = { contact: "", otp: "" };

  // 🔹 OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // 🔹 Generate OTP handler
  const handleGenerateOtp = async (mobile) => {
    if (otpLoading) return; // lock spam clicks
    if (otpTimer > 0) {
      toast.error(`Please wait ${otpTimer} seconds before resending OTP`);
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Enter a valid mobile number first");
      return;
    }

    try {
      setOtpLoading(true);
      const res = await dispatch(sendOtp_login(mobile));
      if (res.success) {
        toast.success("OTP sent successfully");
        setOtpSent(true);
        setOtpTimer(120); // start 2-min countdown
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong while sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // 🔹 Login submit handler
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await dispatch(
        verifyOtp({ phoneNumber: values.contact, phoneOtp: values.otp })
      );

      if (!res.success) {
        toast.error(res.message || "Invalid OTP");
        setSubmitting(false);
        return;
      }

      const user = res.data;
      localStorage.setItem("accessToken", user.token);

      // toast.success("Login successful!");

      // 🔹 Step 1: Pending booking redirect
    // 🔹 Step 1: Pending booking redirect
const pendingBooking = localStorage.getItem("pendingBooking");
if (pendingBooking) {
  const bookingIntent = JSON.parse(pendingBooking);

  const isValid = Date.now() - bookingIntent.timestamp < 24 * 60 * 60 * 1000;

  if (isValid && bookingIntent.propertyId) {
    // keep in localStorage so reload still works

    navigate(`/home/book-my-properties/${bookingIntent.propertyId}`, {
      state: {
        property: bookingIntent.property,
        selectedPurpose: bookingIntent.selectedPurpose,
        hideHeader: true,
      },
      replace: true, // prevent back navigation to login
    });
    return; // stop execution
  } else {
    localStorage.removeItem("pendingBooking"); // expired
  }
}


      // 🔹 Step 2: PrivateOutlet redirect
      const redirectData = sessionStorage.getItem("postLoginRedirect");
      if (redirectData) {
        const { pathname, state } = JSON.parse(redirectData);
        sessionStorage.removeItem("postLoginRedirect");
        navigate(pathname, { state, replace: true });
        return;
      }

      // 🔹 Step 3: Default fallback
      navigate("/home/my-properties", { replace: true });
    } catch (err) {
      toast.error("Something went wrong during login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-y-scroll hide-scrollbar flex justify-evenly items-center flex-col sm:flex-row gap-2 p-2 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#264653] via-[#2c5968] to-[#264658]">
        <div className="absolute w-[40rem] h-[40rem] bg-gradient-radial from-[#71B3CE]/50 to-transparent opacity-70 rounded-full blur-[150px] -top-40 -left-40"></div>
        <div className="absolute w-[35rem] h-[35rem] bg-gradient-radial from-[#71B3CE]/40 to-transparent opacity-60 rounded-full blur-[140px] -bottom-32 -right-32"></div>
        <div className="absolute w-[25rem] h-[25rem] bg-gradient-radial from-white/10 to-transparent opacity-30 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')" }}
        ></div>
      </div>
      <div className="absolute inset-0 bg-cover bg-center opacity-55" style={{ mixBlendMode: "overlay" }}></div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-5 p-3 m-1">
        <div className="bg-white/25 backdrop-blur-lg shadow-2xl p-5 rounded-2xl border border-white/20">
          <img src="/newbg.png" alt="logo" width="550" className="rounded-lg drop-shadow-xl" />
        </div>
        <div className="text-white font-semibold text-3xl max-w-xl text-center uppercase drop-shadow-lg">
          {CONSTANTS.LOGIN_PAGE_PROJECT_NAME}
        </div>

         <div className="text-white font-semibold text-sm max-w-xl text-center uppercase drop-shadow-lg">
          {CONSTANTS.SDA_ADDRESS}
        </div>
      </div>

      {/* Login Card */}
      <div className="m-1 px-8 max-w-md rounded-2xl shadow-2xl bg-white/40 backdrop-blur-lg border border-white/20 text-center w-[300px] sm:w-[350px] md:w-[380px] relative z-10">
        <h3 className="my-8 text-gray-700 font-bold uppercase">{CONSTANTS.PAGE.SIGN_IN}</h3>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="mb-8 space-y-4">
              {/* Mobile */}
              {/* <div>
                <label className="block text-left text-sm font-medium text-gray-900">Mobile Number</label>
                <Field
                  type="text"
                  name="contact"
                  className="custom-input bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg"
                  placeholder="Enter mobile number"
                  maxLength="10"
                  disabled={otpTimer > 0}
                  onKeyDown={(e) => !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.preventDefault()}
                  onChange={(e) => {
                    setFieldValue("contact", e.target.value);
                    setOtpSent(false);
                  }}
                />
                <ErrorMessage name="contact" component="div" className="text-xs text-red-500 text-left" />
              </div> */}

{/* Mobile */}
<div>
  <label className="block text-left text-sm font-medium text-gray-900">Mobile Number</label>
  <Field
    type="text"
    name="contact"
    className="custom-input bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg"
    placeholder="Enter mobile number"
    maxLength="10"
    // Remove the disabled prop completely
    onKeyDown={(e) => !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.preventDefault()}



    onChange={(e) => {
      setFieldValue("contact", e.target.value);
      // Reset OTP state and timer when user edits mobile number
      if (otpSent || otpTimer > 0) {
        setOtpSent(false);
        setOtpTimer(0);
        setFieldValue("otp", ""); // Clear OTP field as well
      }
    }}
  />
  <ErrorMessage name="contact" component="div" className="text-xs text-red-500 text-left" />
</div>
              {/* OTP */}
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">OTP</label>
                <Field
                  type="text"
                  name="otp"
                  className="custom-input bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  disabled={!otpSent}
                  // onKeyDown={(e) => !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.preventDefault()}



                  onKeyDown={(e) => {
  // Allow Ctrl/Cmd + V, Backspace, Tab, Arrow keys
  if (
    e.ctrlKey && e.key === "v" || // Ctrl+V
    e.metaKey && e.key === "v" || // Cmd+V
    ["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    return;
  }

  // Block non-numeric
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}}

                />
                <ErrorMessage name="otp" component="div" className="text-xs text-red-500 text-left" />
              </div>

              {/* OTP Button */}
              <button
                type="button"
                onClick={() => handleGenerateOtp(values.contact)}
                disabled={otpTimer > 0 || otpLoading}
                className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary2 w-full"
              >
                {otpLoading
                  ? "Sending..."
                  : otpTimer > 0
                  ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, "0")}`
                  : otpSent
                  ? "Resend OTP"
                  : "Generate OTP"}
              </button>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || !otpSent}
                className="bg-primary text-white py-2 px-4 w-full rounded-lg shadow-lg hover:bg-primary2"
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </button>

              {/* Signup Redirect */}
              <button
                type="button"
                onClick={() => navigate('/sign-up')}
                className="text-sm mt-2 text-gray-700 underline"
              >
                Not a user? Sign up here
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <Toaster />
    </div>
  );
};

export default CustomerLoginPage;

