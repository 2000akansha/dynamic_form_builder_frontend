import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userSignup } from "../../redux/apis/auth"; // your updated signup redux
import toast, { Toaster } from "react-hot-toast";
import CONSTANTS from "../../constants.json";
import { sendOtp, verifyOtpSignup } from "../../redux/apis/OTP";
import Cookies from "js-cookie";



const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i; // i flag for case-insensitive
const accountNumberRegex = /^(?!0+$)(?!0{4,}\d{0,})(\d{9,18})$/;
const SignupPage = () => {
  const [toastId, setToastId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedNumber, setVerifiedNumber] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
const [showAccountNumber, setShowAccountNumber] = useState(false);
const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Countdown Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),
    customerType: Yup.string().required("Customer type is required"),
email: Yup.string()
  .email("Invalid email format")
  .matches(
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    "Invalid email domain"
  )
  .required("Email is required"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .length(10, "Phone number must be 10 digits"),
    otp: Yup.string().test(
      "otp-required",
      "OTP must be 6 digits",
      function (value) {
        if (otpSent) return !!value && value.length === 6;
        return true;
      }
    ),

   GSTNumber: Yup.string()
  .test(
    "gst-required",
    "GST Number is required for business",
    function (value) {
      return this.parent.customerType === "1" ? !!value : true;
    }
  )
  .test(
    "gst-format",
    "Invalid GST Number format",
    function (value) {
      if (!value) return true; // skip if not required
      return gstRegex.test(value); // case-insensitive
    }
  ),




    businessName: Yup.string().test(
      "business-required",
      "Business Name is required for business",
      function (value) {
        return this.parent.customerType === "1" ? !!value : true;
      }
    ),
    // bankAccountNumber: Yup.string()
    //   .required("Bank account number is required")
    //   .matches(/^[0-9]+$/, "Only numbers are allowed")
    //   .min(9, "Account number must be at least 9 digits")
    //   .max(18, "Account number cannot exceed 18 digits"),
    // confirmBankAccountNumber: Yup.string()
    //   .oneOf([Yup.ref("bankAccountNumber"), null], "Bank account numbers must match")
    //   .required("Confirm bank account number is required"),



     bankAccountNumber: Yup.string()
    .required("Bank account number is required")
    .matches(
      accountNumberRegex,
      "Enter a valid account number (9-18 digits, cannot be all zeros)"
    )
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number cannot exceed 18 digits"),

  confirmBankAccountNumber: Yup.string()
    .oneOf(
      [Yup.ref("bankAccountNumber"), null],
      "Bank account numbers must match"
    )
    .required("Confirm bank account number is required"),

    ifscCode: Yup.string()
      .required("IFSC Code is required")
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
    bankName: Yup.string()
      .required("Bank Name is required")
      .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed")
      .min(3, "Bank Name must be at least 3 characters")
      .max(50, "Bank Name cannot exceed 50 characters"),
    accountHolderName: Yup.string()
      .required("Account Holder Name is required")
      .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed")
      .min(3, "Account Holder Name must be at least 3 characters")
      .max(50, "Account Holder Name cannot exceed 50 characters"),
  });

  const initialValues = {
    name: "",
    customerType: "",
    email: "",
    phoneNumber: "",
    otp: "",
    bankAccountNumber: "",
    confirmBankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
    GSTNumber: "",
    businessName: "",
    status: "0",
  };

  const handleGenerateOtp = async (mobile) => {
    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Enter a valid mobile number first");
      return;
    }
    if (otpLoading) return; // Prevent multiple clicks

  setOtpLoading(true); // Disable button immediately



    try {
    const res = await dispatch(sendOtp(mobile));
    if (res.success) {
      toast.success("OTP sent successfully");
      setOtpSent(true);
      setOtpTimer(60);
    } else {
      toast.error(res.message || "Failed to send OTP");
    }
  } catch (err) {
    toast.error("Something went wrong while sending OTP");
  } finally {
    setOtpLoading(false); // Re-enable button
  }
};

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!otpVerified) {
      toast.error("⚠️ Please verify your OTP first");
      setSubmitting(false);
      return;
    }
    try {
      const payload = { ...values };
      delete payload.confirmBankAccountNumber;
      const res = await dispatch(userSignup(payload));
      if (res.status) {
        if (toastId) toast.dismiss(toastId);
        toast.success("🎉 Signup successful");
        navigate("/login");
      } else {
        if (toastId) toast.dismiss(toastId);
        const id = toast.error(res.message || "Signup failed");
        setToastId(id);
      }
    } catch (err) {
      toast.error("Something went wrong during signup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-y-scroll hide-scrollbar flex justify-evenly items-center flex-col sm:flex-row gap-2 p-2 relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#264653] via-[#2c5968] to-[#264658]">
        <div className="absolute w-[40rem] h-[40rem] bg-gradient-radial from-[#71B3CE]/50 to-transparent opacity-70 rounded-full blur-[150px] -top-40 -left-40"></div>
        <div className="absolute w-[35rem] h-[35rem] bg-gradient-radial from-[#71B3CE]/40 to-transparent opacity-60 rounded-full blur-[140px] -bottom-32 -right-32"></div>
        <div className="absolute w-[25rem] h-[25rem] bg-gradient-radial from-white/10 to-transparent opacity-30 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')" }}
        ></div>
      </div>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ mixBlendMode: "overlay" }}
      ></div>
      {/* Logo */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-5 p-3 m-1">
        <div className="bg-white/35 backdrop-blur-md shadow-2xl p-5 rounded-lg">
          <img src="/newbg.png" alt="logo" width="550" className="rounded-lg" />
        </div>
        <div className="text-white font-semibold text-3xl max-w-xl text-center uppercase drop-shadow-lg">
          {CONSTANTS.LOGIN_PAGE_PROJECT_NAME}
        </div>
         <div className="text-white font-semibold text-sm max-w-xl text-center uppercase drop-shadow-lg">
                  {CONSTANTS.SDA_ADDRESS}
                </div>
      </div>
      {/* Signup Card */}
      <div className="m-1 px-8 max-w-md rounded-xl shadow-2xl bg-white/40 backdrop-blur-md text-center w-[300px] sm:w-[350px] md:w-[380px] lg:w-[380px] relative z-10 max-h-[82%] overflow-auto">
        <h3 className="my-8 text-gray-700 font-bold uppercase">
          {CONSTANTS.PAGE.SIGN_UP}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="mb-8 space-y-4">
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Field
                    type="text"
                    name="phoneNumber"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                    className={`custom-input bg-white/5 backdrop-blur-md flex-1 ${
                      otpVerified ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    placeholder="Enter 10-digit phone number"
                    disabled={otpVerified}
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      disabled={otpTimer > 0}
                      onClick={() => handleGenerateOtp(values.phoneNumber)}
                      className="text-sm px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary2 disabled:bg-gray-400"
                    >
                      {otpTimer > 0
                        ? `Resend OTP (${otpTimer}s)`
                        : otpSent
                        ? "Resend OTP"
                        : "Generate OTP"}
                    </button>
                  )}
                </div>
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                        className="text-sm text-red-900 text-left"

                />
              </div>
              {/* OTP Input */}
              {otpSent && !otpVerified && (
                <div>
                  <label className="block text-left text-sm font-medium text-gray-900">
                    Enter OTP
                  </label>
                  <div className="flex items-center gap-2">
                    <Field
                      type="text"
                      name="otp"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                      className="custom-input bg-white/5 backdrop-blur-md flex-1"
                      placeholder="Enter 6-digit OTP"
                    />
                    <button
                      type="button"
                      disabled={values.otp.length !== 6}
                      onClick={() => {
                        dispatch(
                          verifyOtpSignup({
                            mobileNumber: values.phoneNumber,
                            phoneOtp: values.otp,
                          })
                        ).then((res) => {
                          if (res.success) {
                            toast.success("OTP Verified");
                            setOtpVerified(true);
                            setVerifiedNumber(values.phoneNumber);
                          } else {
                            toast.error(res.message || "Invalid OTP");
                          }
                        });
                      }}
                      className={`text-sm px-3 py-2 rounded-lg text-white ${
                        values.otp.length === 6
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Verify
                    </button>
                  </div>
                  <ErrorMessage
                    name="otp"
                    component="div"
                           className="text-sm text-red-900 text-left"

                  />
                </div>
              )}
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Name
                </label>
                <Field
                  type="text"
                  name="name"
                  disabled={!otpVerified}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  placeholder="Enter full name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                         className="text-sm text-red-900 text-left"

                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Customer Type
                </label>
                <Field
                  as="select"
                  name="customerType"
                  disabled={!otpVerified}
                  className="custom-input bg-white/5 backdrop-blur-md"
                >
                  <option value="">Select Type</option>
                  <option value="0">Individual</option>
                  <option value="1">Business</option>
                </Field>
                <ErrorMessage
                  name="customerType"
                  component="div"
                        className="text-sm text-red-900 text-left"

                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  disabled={!otpVerified}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  placeholder="Enter Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                         className="text-sm text-red-900 text-left"

                />
              </div>
              {/* <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Bank Account Number
                </label>
                <Field
                  type="text"
                  name="bankAccountNumber"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  placeholder="Enter bank account number"
                  disabled={!otpVerified}
                />
                <ErrorMessage
                  name="bankAccountNumber"
                  component="div"
                          className="text-sm text-red-900 text-left"

                />
              </div> */}



              <div className="relative">
  <label className="block text-left text-sm font-medium text-gray-900">
    Bank Account Number
  </label>
  <div className="relative">
    <Field
      type={showAccountNumber ? "text" : "password"}
      name="bankAccountNumber"
      inputMode="numeric"
      pattern="[0-9]*"
      onInput={(e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
      }}
      className="custom-input bg-white/5 backdrop-blur-md pr-10"
      placeholder="Enter bank account number"
      disabled={!otpVerified}
    />
    {/* <button
      type="button"
      onClick={() => setShowAccountNumber(!showAccountNumber)}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900"
      tabIndex={-1}
    >
      {showAccountNumber ? "🙈" : "👁️"}
    </button> */}
  </div>
  <ErrorMessage
    name="bankAccountNumber"
    component="div"
    className="text-sm text-red-900 text-left"
  />
</div>


              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Confirm Bank Account Number
                </label>
                <Field
                  type="text"
                  name="confirmBankAccountNumber"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  placeholder="Re-enter bank account number"
                  disabled={!otpVerified}
                />
                <ErrorMessage
                  name="confirmBankAccountNumber"
                  component="div"
                         className="text-sm text-red-900 text-left"

                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  IFSC Code
                </label>
                <Field
                  type="text"
                  name="ifscCode"
                  maxLength={11}
                  onInput={(e) => {
                    let val = e.target.value.toUpperCase();
                    if (val.length <= 4) {
                      val = val.replace(/[^A-Z]/g, "");
                    } else if (val.length === 5) {
                      val = val.slice(0, 4) + "0";
                    } else if (val.length > 5) {
                      val = val.slice(0, 4) + "0" + val.slice(5).replace(/[^A-Z0-9]/g, "");
                    }
                    e.target.value = val;
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  placeholder="Enter IFSC code"
                  disabled={!otpVerified}
                />
                <ErrorMessage
                  name="ifscCode"
                  component="div"
                         className="text-sm text-red-900 text-left"

                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Bank Name
                </label>
                <Field
                  type="text"
                  name="bankName"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  style={{ textTransform: "uppercase" }}
                  placeholder="Enter bank name"
                  disabled={!otpVerified}
                />
                <ErrorMessage
                  name="bankName"
                  component="div"
        className="text-sm text-red-900 text-left"
                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-gray-900">
                  Account Holder Name
                </label>
                <Field
                  type="text"
                  name="accountHolderName"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  }}
                  className="custom-input bg-white/5 backdrop-blur-md"
                  style={{ textTransform: "uppercase" }}
                  placeholder="Enter account holder name"
                  disabled={!otpVerified}
                />
                <ErrorMessage
                  name="accountHolderName"
                  component="div"
        className="text-sm text-red-900 text-left"
                />
              </div>
              {/* {values.customerType === "1" && (
                <>
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-900">
                      GST Number
                    </label>
                    <Field
                      type="text"
                      name="GSTNumber"
                      disabled={!otpVerified}
                      className="custom-input bg-white/5 backdrop-blur-md"
                      placeholder="Enter GST number"
                    />
                    <ErrorMessage
                      name="GSTNumber"
                      component="div"
                      className="text-xs text-red-500 text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-900">
                      Business Name
                    </label>
                    <Field
                      type="text"
                      name="businessName"
                      disabled={!otpVerified}
                      className="custom-input bg-white/5 backdrop-blur-md"
                      placeholder="Enter business name"
                    />
                    <ErrorMessage
                      name="businessName"
                      component="div"
                      className="text-xs text-red-500 text-left"
                    />
                  </div>
                </>
              )} */}





{values.customerType === "1" && (
  <>
    <div>
      <label className="block text-left text-sm font-medium text-gray-900">
        GST Number
      </label>
      <Field
        type="text"
        name="GSTNumber"
        disabled={!otpVerified}
        className="custom-input bg-white/5 backdrop-blur-md"
        placeholder="Enter GST number"
        maxLength={15}
        onInput={(e) => {
          // Force uppercase and remove invalid chars
          e.target.value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
        }}
      />
      <ErrorMessage
        name="GSTNumber"
        component="div"
        className="text-sm text-red-900 text-left"
      />
    </div>
    <div>
      <label className="block text-left text-sm font-medium text-gray-900">
        Business Name
      </label>
      <Field
        type="text"
        name="businessName"
        disabled={!otpVerified}
        className="custom-input bg-white/5 backdrop-blur-md"
        placeholder="Enter business name"
      />
      <ErrorMessage
        name="businessName"
        component="div"
        className="text-sm text-red-900 text-left"
      />
    </div>
  </>
)}

              <button
                type="submit"
                disabled={isSubmitting || !otpVerified}
                className="bg-primary text-white py-2 px-4 w-full rounded-lg hover:bg-primary2 transition-all duration-300 disabled:bg-gray-400"
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm mt-3 text-gray-200 underline hover:text-white"
              >
                Already have an account? Login here
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <Toaster />
    </div>
  );
};











export default SignupPage;
