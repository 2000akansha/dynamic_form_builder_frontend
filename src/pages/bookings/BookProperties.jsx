import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAllPurposeFrontend } from "../../redux/apis/property_purpose";
import { FileText, Calendar, IndianRupee } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import apiClient from "../../utils/axois";
import { useDispatch, useSelector } from "react-redux";
import { saveBookingDetailsPriorPayment } from "../../redux/apis/saveBooking";

const BASE_URL = import.meta.env.VITE_PAYMENT_BASE_URL;

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// utils/getTodayDateIST.js
export const getTodayDateIST = async () => {
  try {
    const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
    const data = await res.json();

    // Convert API datetime string to Date object
    const istDate = new Date(data.datetime);

    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const day = String(istDate.getDate()).padStart(2, "0");

    // Return same format as your original getTodayDate()
    return `${year}-${month}-${day}`;
  } catch (err) {
    return null;
  }
};


const addDaysToDateStr = (dateStr, daysToAdd) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + daysToAdd);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const dateToStr = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return null;
  const istOffset = 5.5 * 60; // 5 hours 30 minutes in minutes
  const localTime = new Date(d.getTime() + (d.getTimezoneOffset() + istOffset) * 60000);
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const strToDate = (input) => {
  if (!input) return null;
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    const parts = input.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return null;
};

const getDateRangeArray = (startStr, endStr) => {
  const out = [];
  let cur = strToDate(startStr);
  const end = strToDate(endStr);
  while (cur <= end) {
    out.push(dateToStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDatesInRange = (start, end) => {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const BookProperties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { accessToken } = useSelector(
    (state) => state.userDetailsSlice.details || {}
  );
  const token = accessToken;

  const getBookingData = () => {
    if (location.state?.property) return location.state;
    const pending = localStorage.getItem("pendingBooking");
    if (pending) {
      const bookingIntent = JSON.parse(pending);
      if (bookingIntent.propertyId === id) return bookingIntent;
    }
    return null;
  };

  const [bookingData, setBookingData] = useState(() => getBookingData());
  const property = bookingData?.property || null;
  const selectedPurpose = bookingData?.selectedPurpose || null;
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [availableBookingDays, setAvailableBookingDays] = useState([]);
  const [totalAvailableDays, setTotalAvailableDays] = useState(0);
  const [purposes, setPurposes] = useState([]);
  const [bookingFromDate, setBookingFromDate] = useState("");
  const [bookingUptoDate, setBookingUptoDate] = useState("");
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [showBreakup, setShowBreakup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [finalBookedDates, setFinalBookedDates] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const savePromiseRef = useRef(null);
  const [bookingPurpose, setBookingPurpose] = useState(selectedPurpose?.purpose || "");
  const [selectedPurposePrice, setSelectedPurposePrice] = useState(selectedPurpose?.purposePrice || 0);
  const [excludedDates, setExcludedDates] = useState([]);
const [todayIST, setTodayIST] = useState(null);
 const fromDateRef = useRef(null);
  const uptoDateRef = useRef(null);





  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue", { position: "top-right" });
      navigate("/login", { replace: true });
      return;
    }
    if (!bookingData) {
      toast.error("No booking data found", { position: "top-right" });
      navigate("/home/my-properties", { replace: true });
      return;
    }
  }, [bookingData, navigate, token]);

  useEffect(() => {
    if (bookingData) {
      localStorage.removeItem("pendingBooking");
    }
  }, [bookingData]);

  const getExcludedDates = (purpose) => {
    const dates = [];
    (property?.bookedDates || []).forEach((booking) => {
      const startStr = booking.bookedFromDate || booking.bookedFrom;
      const endStr = booking.bookedUptoDate || booking.bookedUpto;
      if (startStr && endStr) {
        const dateRange = getDateRangeArray(startStr, endStr);
        dateRange.forEach((dateStr) => {
          const dateObj = new Date(dateStr + "T00:00:00");
          dates.push(normalizeDate(dateObj));
        });
      }
    });
    return dates;
  };

  useEffect(() => {
    if (bookingPurpose) {
      setExcludedDates(getExcludedDates(bookingPurpose));
    } else {
      setExcludedDates([]);
    }
  }, [bookingPurpose, property]);

  const isDateExcluded = (dateStr) => {
    const checkDate = normalizeDate(new Date(dateStr));
    return excludedDates.some((excludedDate) => {
      const normalizedExcluded = normalizeDate(excludedDate);
      return checkDate.getTime() === normalizedExcluded.getTime();
    });
  };

  const hasExcludedDatesInRange = (fromDate, uptoDate) => {
    const currentDate = new Date(fromDate);
    const endDate = new Date(uptoDate);
    while (currentDate <= endDate) {
      const dateStr = dateToStr(currentDate);
      if (isDateExcluded(dateStr)) return true;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  const getAvailableDatesInRange = (fromDate, uptoDate) => {
    const availableDates = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(uptoDate);
    while (currentDate <= endDate) {
      const dateStr = dateToStr(currentDate);
      if (!isDateExcluded(dateStr)) {
        availableDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return availableDates;
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue", { position: "top-right" });
      navigate("/login");
    }
  }, [navigate, token]);

  const [conflictDate, setConflictDate] = useState(null);
  const taxPercent = property?.taxPercent ?? 18;
  const taxAmount = (totalBookingAmount * taxPercent) / 100;
  const totalWithTax = totalBookingAmount + taxAmount;
  const bookingWindow = Number(property?.propertyRule?.bookingWindow ?? 30);
  const stayDuration = Number(property?.propertyRule?.stayDuration ?? 10);
  const maxBookingFromDate = addDaysToDateStr(getTodayDate(), bookingWindow);
  const maxBookingUptoDate = bookingFromDate
    ? addDaysToDateStr(bookingFromDate, stayDuration - 1)
    : "";

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const res = await getAllPurposeFrontend();
        if (res?.success) {
          setPurposes(res.data);
        }
      } catch (err) {
      }
    };
    fetchPurposes();
  }, []);
useEffect(() => {
const fetchIST = async () => {
  try {
    const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
    if (!res.ok) throw new Error("API response not OK");
    const data = await res.json();
    const istDate = new Date(data.datetime);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const day = String(istDate.getDate()).padStart(2, "0");
    setTodayIST(`${year}-${month}-${day}`);
  } catch (error) {
    // Convert system time to IST manually
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 5.5 * 60 * 60000);
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, "0");
    const day = String(istTime.getDate()).padStart(2, "0");
    setTodayIST(`${year}-${month}-${day}`);
  }
};


  fetchIST();
}, []);
  const handlePurposeChange = (e) => {
    const selectedPurpose = e.target.value;
    setBookingPurpose(selectedPurpose);
    const selectedObj = property?.purposeType?.find(
      (p) => p.purpose === selectedPurpose
    );
    if (selectedObj) {
      setSelectedPurposePrice(selectedObj.purposePrice);
    } else {
      setSelectedPurposePrice(0);
      setTotalBookingAmount(0);
    }
  };

  const handleFromDateChange = (date) => {
    const str = dateToStr(date);
    if (isDateExcluded(str)) {
      return;
    }
    setBookingFromDate(str);
    setBookingUptoDate("");
  };

  const handleUptoDateChange = (date) => {
    const str = dateToStr(date);
    if (bookingFromDate && str) {
      const daysInRange = getDatesInRange(strToDate(bookingFromDate), str).map(
        (d) => dateToStr(d)
      );
      const conflict = daysInRange.find((d) => isDateExcluded(d));
      if (conflict) {
        setConflictDate(conflict);
        setShowConfirmationDialog(true);
        setBookingUptoDate("");
        return;
      }
    }
    setBookingUptoDate(str);
  };

  const handleConfirmBooking = () => {
    setShowConfirmationDialog(false);
    if (availableBookingDays.length > 0) {
      setFinalBookedDates(availableBookingDays.map((d) => dateToStr(d)));
    }
  };

  const handleCancelBooking = () => {
    setShowConfirmationDialog(false);
    setBookingUptoDate("");
    setAvailableBookingDays([]);
    setTotalAvailableDays(0);
    setFinalBookedDates([]);
  };

  useEffect(() => {
    if (
      bookingPurpose &&
      selectedPurposePrice > 0 &&
      bookingFromDate &&
      bookingUptoDate
    ) {
      const from = strToDate(bookingFromDate);
      const to = strToDate(bookingUptoDate);
      if (from && to && to >= from) {
        const diffDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setTotalBookingAmount(diffDays * selectedPurposePrice);
      } else {
        setTotalBookingAmount(0);
      }
    } else {
      setTotalBookingAmount(0);
    }
  }, [bookingPurpose, selectedPurposePrice, bookingFromDate, bookingUptoDate]);

  const saveBookingDetails = async () => {
    try {
      const bookedForDaysCount =
        bookingFromDate && bookingUptoDate
          ? Math.floor(
              (new Date(bookingUptoDate) - new Date(bookingFromDate)) /
                (1000 * 3600 * 24)
            ) + 1
          : 0;
      const bookingData = {
        propertyId: property?._id,
        bookingPurpose,
        amount: Math.ceil(totalWithTax),
        baseAmount: totalBookingAmount,
        before_roundoff_amount: totalWithTax,
        propertyPrintableId: property?.propertyUniqueId,
        taxAmount,
        taxPercentage: taxPercent,
        bookedForDaysCount:
          finalBookedDates.length > 0
            ? finalBookedDates.length
            : bookedForDaysCount,
        bookedFromDate: finalBookedDates.length === 0 ? bookingFromDate : undefined,
        bookedUptoDate: finalBookedDates.length === 0 ? bookingUptoDate : undefined,
        bookedOnDates: finalBookedDates.length > 0 ? finalBookedDates : undefined,
      };
      const result = await dispatch(saveBookingDetailsPriorPayment(bookingData));
      if (result.status === "success") {
        return { ...bookingData, bookingId: result.bookingId };
      } else {
        toast.error(result.message || "Failed to save booking details");
        return null;
      }
    } catch (error) {
      toast.error("Failed to save booking details. Please try again.");
      return null;
    }
  };

  const createOrder = async (bookingId) => {
    try {
      const bookedForDaysCount =
        bookingFromDate && bookingUptoDate
          ? Math.floor(
              (new Date(bookingUptoDate) - new Date(bookingFromDate)) /
                (1000 * 3600 * 24)
            ) + 1
          : 0;

      const orderPayload = {
        bookingId,
        amount: Math.ceil(totalWithTax),
        bookingAmount: totalBookingAmount,
        currency: "INR",
        propertyId: property?._id,
        bookingPurpose,
        propertyPrintableId: property?.propertyUniqueId,
        taxAmount,
        taxPercentage: taxPercent,
        baseAmount: totalBookingAmount,
        bookedFromDate:
          finalBookedDates.length === 0 ? bookingFromDate : undefined,
        bookedUptoDate: finalBookedDates.length === 0 ? bookingUptoDate : undefined,
        bookedOnDates:
          finalBookedDates.length > 0 ? finalBookedDates : undefined,
        bookedForDaysCount:
          finalBookedDates.length > 0
            ? finalBookedDates.length
            : bookedForDaysCount,
      };

      const res = await apiClient.post(
        `${BASE_URL}/api/v1/payment/create-order`,
        orderPayload,
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        return {
          orderId: res.data.data[0].orderId,
          amount: res.data.data[0].amount,
          currency: res.data.data[0].currency,
          bookingId: res.data.data[0].bookingId,
        };
      }
    } catch (error) {
      if (error.response) {
        const { code, message } = error.response.data;
        const errorMessage =
          code === "AMOUNT_TAMPERED"
            ? " The payment amount does not match the booking amount. Please verify and try again."
            : message?.[0] || "Failed to create order";
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(" Failed to create order. Please try again.", {
          duration: 5000,
        });
      }
      return null;
    }
  };

  const handleHostedCheckout = async (order) => {
    const { orderId, amount, currency, bookingId } = order;
    const bookedForDaysCount =
      bookingFromDate && bookingUptoDate
        ? Math.floor(
            (new Date(bookingUptoDate) - new Date(bookingFromDate)) /
              (1000 * 3600 * 24)
          ) + 1
        : 0;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://api.razorpay.com/v1/checkout/embedded";
    const fields = {
      key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount.toString(),
      currency,
      order_id: orderId,
      name: "Customer Portal",
      description: "Property Booking Payment",
      image: "https://yourdomain.com/logo.png",
      "prefill[name]": "John Doe",
      "prefill[contact]": "9999999999",
      "prefill[email]": "john.doe@example.com",
      "notes[bookingId]": bookingId,
      "notes[propertyId]": property?._id,
      "notes[bookedFromDate]": bookingFromDate,
      "notes[bookedUptoDate]": bookingUptoDate,
      "notes[bookedForDaysCount]": bookedForDaysCount,
      "notes[bookingAmount]": totalBookingAmount,
      "notes[taxAmount]": taxAmount,
      "notes[taxPercentage]": taxPercent,
      "notes[baseAmount]": totalBookingAmount,
      "notes[bookingPurpose]": bookingPurpose,
      callback_url: `${BASE_URL}/api/v1/payment/verify-payment`,
      cancel_url: `${import.meta.env.VITE_FRONTEND_URL}/failed`,
    };
    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleCountdownComplete = async () => {
    try {
      setLoading(true);
      const saved = await savePromiseRef.current;
      savePromiseRef.current = null;
      if (!saved) throw new Error("Failed to save booking details");
      setBookingId(saved.bookingId);
      const order = await createOrder(saved.bookingId);
      if (!order) throw new Error("Failed to create order");
      await handleHostedCheckout(order);
    } catch (error) {
    } finally {
      setShowCountdown(false);
      setCountdown(5);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCountdown && countdown === 0) {
      handleCountdownComplete();
    }
  }, [showCountdown, countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowCountdown(true);
    setCountdown(5);
    savePromiseRef.current = saveBookingDetails();
  };

  return (
    <>
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Redirecting to Payment Gateway
              </h2>
              <p className="text-gray-600">
                Please wait while we prepare your payment...
              </p>
            </div>
            <div className="mb-6">
              {countdown > 0 ? (
                <>
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {countdown}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  <div className="w-20 h-20 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {countdown > 0
                ? `You will be redirected automatically in ${countdown} second${
                    countdown !== 1 ? "s" : ""
                  }`
                : "Finalizing details, this may take a moment..."}
            </p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full bg-white shadow-xl rounded-2xl flex gap-12 p-10">
          {property && (
            <div className="w-1/2 flex flex-col overflow-y-auto max-h-[85vh] pr-8 border-r border-gray-300">
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {property.photoURL?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${property.name} - ${idx + 1}`}
                    className="h-48 w-80 object-cover rounded-xl shadow-md flex-shrink-0"
                    crossOrigin="anonymous"
                  />
                ))}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                {property.name}
              </h2>
              <span className="text-gray-700 mb-6 leading-relaxed">
                Property ID: {property.propertyUniqueId}
              </span>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {property.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {property.address && (
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                    <span>{property.address}</span>
                  </div>
                )}
                {property.capacity && (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                    <span>{property.capacity} people</span>
                  </div>
                )}
              </div>
              {property.purposeType?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">
                    Available Purposes
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {property.purposeType.map((p, i) => (
                      <div
                        key={i}
                        className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center space-x-2"
                      >
                        <span>{p.purpose}</span>
                        <span className="font-bold">₹{p.purposePrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {property.termsCondition && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Terms & Conditions
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-lg shadow-inner max-h-48 overflow-y-auto text-gray-700 whitespace-pre-wrap text-sm">
                    {property.termsCondition}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="w-1/2 px-8">
            <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3 text-gray-900">
              <FileText className="text-blue-600" /> Book Property
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Booking Purpose
                </label>
                <select
                  value={bookingPurpose}
                  onChange={handlePurposeChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select Purpose</option>
                  {property?.purposeType?.map((p, idx) => (
                    <option key={idx} value={p.purpose}>
                      {p.purpose}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPurposePrice > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-extrabold text-blue-700">
                    {selectedPurposePrice.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-lg italic font-medium text-gray-500">
                    / day (excl. taxes)
                  </span>
                </div>
              )}
{/*
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Booking From Date
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <Calendar className="text-gray-400 mr-3" />
                  <DatePicker
                    selected={strToDate(bookingFromDate)}
                    onChange={handleFromDateChange}
                    // minDate={new Date(getTodayDateIST())}
                     minDate={todayIST ? new Date(todayIST) : null} // wait for IST date
                    maxDate={new Date(maxBookingFromDate)}
                    excludeDates={excludedDates}
                    dateFormat="yyyy-MM-dd"
                    className="w-full bg-white text-gray-900 focus:outline-none border-none"
                    placeholderText="Select From Date"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Booking Upto Date
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <Calendar className="text-gray-400 mr-3" />
                  <DatePicker
                    selected={strToDate(bookingUptoDate)}
                    onChange={handleUptoDateChange}
                    // minDate={
                    //   bookingFromDate
                    //     ? new Date(bookingFromDate)
                    //     : new Date(getTodayDate())
                    // }

                      minDate={
    bookingFromDate
      ? new Date(bookingFromDate)
      : todayIST
      ? new Date(todayIST)
      : null
  }
                    maxDate={
                      maxBookingUptoDate ? new Date(maxBookingUptoDate) : null
                    }
                    excludeDates={excludedDates}
                    dateFormat="yyyy-MM-dd"
                    className="w-full bg-white text-gray-900 focus:outline-none border-none"
                    placeholderText="Select Upto Date"
                    required
                    disabled={!bookingFromDate}
                  />
                </div>
              </div> */}

              <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Booking From Date
        </label>
        <div
          className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer"
          onClick={() => fromDateRef.current?.setOpen(true)} // 👈 opens calendar
        >
          <Calendar className="text-gray-400 mr-3" />
          <DatePicker
            ref={fromDateRef}
            selected={strToDate(bookingFromDate)}
            onChange={handleFromDateChange}
            minDate={todayIST ? new Date(todayIST) : null}
            maxDate={new Date(maxBookingFromDate)}
            excludeDates={excludedDates}
            dateFormat="yyyy-MM-dd"
            className="w-full bg-white text-gray-900 focus:outline-none border-none cursor-pointer"
            placeholderText="Select From Date"
            required
            onFocus={(e) => e.target.blur()} // prevent double open glitch
          />
        </div>
      </div>

      {/* Booking Upto Date */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Booking Upto Date
        </label>
        <div
          className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 ${
            !bookingFromDate ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() =>
            bookingFromDate && uptoDateRef.current?.setOpen(true) // 👈 opens calendar only if fromDate selected
          }
        >
          <Calendar className="text-gray-400 mr-3" />
          <DatePicker
            ref={uptoDateRef}
            selected={strToDate(bookingUptoDate)}
            onChange={handleUptoDateChange}
            minDate={
              bookingFromDate
                ? new Date(bookingFromDate)
                : todayIST
                ? new Date(todayIST)
                : null
            }
            maxDate={
              maxBookingUptoDate ? new Date(maxBookingUptoDate) : null
            }
            excludeDates={excludedDates}
            dateFormat="yyyy-MM-dd"
            className="w-full bg-white text-gray-900 focus:outline-none border-none cursor-pointer"
            placeholderText="Select Upto Date"
            required
            disabled={!bookingFromDate}
            onFocus={(e) => e.target.blur()} // prevent weird focus behaviour
          />
        </div>
      </div>


              {showConfirmationDialog && conflictDate && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-2xl shadow-xl w-[450px] p-6">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">
                      Sorry, this date is already booked!
                    </h2>
                    <p className="mb-6">
                      The date <strong>{conflictDate}</strong> is unavailable
                      within your selected range. Please select a new date range.
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setShowConfirmationDialog(false);
                          setConflictDate(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Total Booking Amount (Incl. Taxes)
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed">
                  <IndianRupee className="text-gray-400 mr-3" />
                  <span className="w-full text-gray-700 font-semibold">
                    {totalWithTax
                      ? `${Math.ceil(totalWithTax).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        })} (${totalWithTax.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })})`
                      : "₹0.00"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBreakup(!showBreakup)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {showBreakup ? "Hide Price Breakup" : "Show Price Breakup"}
              </button>
              {showBreakup && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-800">
                  <div className="flex justify-between mb-2">
                    <span>Base Price:</span>
                    <span>
                      {totalBookingAmount === 1
                        ? (1).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : totalBookingAmount.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span>Tax ({taxPercent}%):</span>
                    <span>
                      {totalBookingAmount === 1
                        ? taxAmount.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : taxAmount.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                  </div>

                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total (Incl. Taxes):</span>
                    <span>
                      {totalWithTax
                        ? `${Math.ceil(totalWithTax).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          })} (${totalWithTax.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })})`
                        : "₹0.00"}
                    </span>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || showCountdown}
                className={`w-full font-semibold py-3 rounded-lg transition ${
                  loading || showCountdown
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {loading
                  ? "Processing..."
                  : showCountdown
                  ? "Redirecting..."
                  : "Book Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookProperties;








































































