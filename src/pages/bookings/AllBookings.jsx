import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllBookedPropertiesAdminFrontend, getMyBookedPropertiesFrontend } from "../../redux/apis/properties";
import Pagination from "../../components/Pagination";
import convertToINR from "../../utils/convertToINR";
import { getAllPurposeFrontend } from "../../redux/apis/property_purpose";
import CancelBookingModal from "../../components/RejectModal";
import { cancelBookingFrontend, getBookingDetailsFrontend } from "../../redux/apis/CancellationBooking";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import apiClient from "../../utils/axois";
import getCookie from "../../utils/RoleBasedRedirect";

const BASE_API_URL = import.meta.env.VITE_PAYMENT_BASE_URL;








const getBookingStatus = (status) => {
  const code = typeof status === "string" ? parseInt(status) : status;
  switch (code) {
    // case 0:
    //   return {
    //     label: "Pending",
    //     color: "bg-amber-50 text-amber-700 border-amber-200",
    //     dot: "bg-amber-400",
    //   };


      case 0:
    case 2:
      return {
        label: "Failed",
        color: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-400",
      };
    case 1:
      return {
        label: "Confirmed",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-400",
      };
    // case 2:
    //   return {
    //     label: "Failed",
    //     color: "bg-red-50 text-red-700 border-red-200",
    //     dot: "bg-red-400",
    //   };
    case 3:
      return {
        label: "Completed",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
      };
         case 4:
      return {
        label: "Cancelled",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
      };
    default:
      return {
        label: status,
        color: "bg-gray-50 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
      };
  }
};



const AllBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // const token = getCookie("accessToken");

  const { accessToken } = useSelector(
    (state) => state.userDetailsSlice.details || {}
  );
  const token = accessToken; // ✅ now `token` is from Redux



  const userRoleFromRedux = useSelector((state) => state.userDetailsSlice.details.userRole);


  // ✅ Fallback to cookie if Redux doesn’t have it yet
  const userRole = userRoleFromRedux || getCookie("role") || null;

  // Filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
const [downloadingBookingId, setDownloadingBookingId] = useState(null);

  const [propertyName, setPropertyName] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingCreatedFrom, setBookingCreatedFrom] = useState("");
  const [bookingCreatedTo, setBookingCreatedTo] = useState("");
  const [bookedFromDateFrom, setBookedFromDateFrom] = useState("");
  const [bookedFromDateTo, setBookedFromDateTo] = useState("");
  const [bookedUptoDateFrom, setBookedUptoDateFrom] = useState("");
  const [bookedUptoDateTo, setBookedUptoDateTo] = useState("");
  const [bookingAmountMin, setBookingAmountMin] = useState("");
  const [bookingAmountMax, setBookingAmountMax] = useState("");
  const [selectedPurposes, setSelectedPurposes] = useState({});
  const [purposes, setPurposes] = useState([]);
  const [filterPurpose, setFilterPurpose] = useState("all");

  const [showFilters, setShowFilters] = useState(false);

  const [bookingsData, setBookingsData] = useState({
    bookings: [],
    totalCount: 0,
    page: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [bookingDetails, setBookingDetails] = useState(null); // <-- store API response here
const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);


const handleOpenCancelModal = async (bookingId) => {
  setLoadingBookingDetails((prev) => ({ ...prev, [bookingId]: true }));
  try {
    const response = await getBookingDetailsFrontend({
      bookingId,
      token,
    });
    setBookingDetails(response);
    setSelectedBookingId(bookingId);
    setIsCancelModalOpen(true);
  } catch (error) {
  } finally {
    setLoadingBookingDetails((prev) => ({ ...prev, [bookingId]: false }));
  }
};
  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const res = await getAllPurposeFrontend();
        if (res.success) {
          setPurposes(res.data);
        } else {
        }
      } catch (error) {
      }
    };

    fetchPurposes();
  }, []);

const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllBookedPropertiesAdminFrontend({
        page,
        limit,
        propertyName,
        bookingPurpose,
        bookingStatus,
        bookingCreatedFrom,
        bookingCreatedTo,
        bookedFromDateFrom,
        bookedFromDateTo,
        bookedUptoDateFrom,
        bookedUptoDateTo,
        bookingAmountMin,
        bookingAmountMax,
      });
      if (res.success) {
        setBookingsData(res.data);
      } else {
        setError(res.message);
        setBookingsData({ bookings: [], totalCount: 0, page, limit });
      }
    } catch (err) {
      setError("Failed to fetch bookings");
      setBookingsData({ bookings: [], totalCount: 0, page, limit });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [
    page,
    limit,
    propertyName,
    bookingPurpose,
    bookingStatus,
    bookingCreatedFrom,
    bookingCreatedTo,
    bookedFromDateFrom,
    bookedFromDateTo,
    bookedUptoDateFrom,
    bookedUptoDateTo,
    bookingAmountMin,
    bookingAmountMax,
  ]);

useEffect(() => {
  fetchBookings();
}, [
  page,
  limit,
  propertyName,
  bookingPurpose,
  bookingStatus,
  bookingCreatedFrom,
  bookingCreatedTo,
  bookedFromDateFrom,
  bookedFromDateTo,
  bookedUptoDateFrom,
  bookedUptoDateTo,
  bookingAmountMin,
  bookingAmountMax,
]);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const removeFilter = (filterKey) => {
    switch (filterKey) {
      case "propertyName":
        setPropertyName("");
        break;
      case "bookingPurpose":
        setBookingPurpose("");
        break;
      case "bookingStatus":
        setBookingStatus("");
        break;
      case "bookingCreatedFrom":
        setBookingCreatedFrom("");
        break;
      case "bookingCreatedTo":
        setBookingCreatedTo("");
        break;
      case "bookedFromDateFrom":
        setBookedFromDateFrom("");
        break;
      case "bookedFromDateTo":
        setBookedFromDateTo("");
        break;
      case "bookedUptoDateFrom":
        setBookedUptoDateFrom("");
        break;
      case "bookedUptoDateTo":
        setBookedUptoDateTo("");
        break;
      case "bookingAmountMin":
        setBookingAmountMin("");
        break;
      case "bookingAmountMax":
        setBookingAmountMax("");
        break;
      default:
        break;
    }
    setPage(1);
  };

  const clearAllFilters = () => {
    setPropertyName("");
    setBookingPurpose("");
    setBookingStatus("");
    setBookingCreatedFrom("");
    setBookingCreatedTo("");
    setBookedFromDateFrom("");
    setBookedFromDateTo("");
    setBookedUptoDateFrom("");
    setBookedUptoDateTo("");
    setBookingAmountMin("");
    setBookingAmountMax("");
    setSearchTerm("");
    setPage(1);
  };

  const renderFilterChips = () => {
    const chips = [];
    if (propertyName)
      chips.push({ label: `Property: ${propertyName}`, key: "propertyName" });
    if (bookingPurpose)
      chips.push({ label: `Purpose: ${bookingPurpose}`, key: "bookingPurpose" });
    if (bookingStatus)
      chips.push({ label: `Status: ${bookingStatus}`, key: "bookingStatus" });
    if (bookingCreatedFrom)
      chips.push({ label: `Created From: ${bookingCreatedFrom}`, key: "bookingCreatedFrom" });
    if (bookingCreatedTo)
      chips.push({ label: `Created To: ${bookingCreatedTo}`, key: "bookingCreatedTo" });
    if (bookedFromDateFrom)
      chips.push({ label: `Booked From: ${bookedFromDateFrom}`, key: "bookedFromDateFrom" });
    if (bookedFromDateTo)
      chips.push({ label: `Booked To: ${bookedFromDateTo}`, key: "bookedFromDateTo" });
    if (bookedUptoDateFrom)
      chips.push({ label: `Booked Until From: ${bookedUptoDateFrom}`, key: "bookedUptoDateFrom" });
    if (bookedUptoDateTo)
      chips.push({ label: `Booked Until To: ${bookedUptoDateTo}`, key: "bookedUptoDateTo" });
    if (bookingAmountMin)
      chips.push({ label: `Min: ₹${bookingAmountMin}`, key: "bookingAmountMin" });
    if (bookingAmountMax)
      chips.push({ label: `Max: ₹${bookingAmountMax}`, key: "bookingAmountMax" });

    if (chips.length === 0) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map(({ label, key }) => (
            <div
              key={key}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => removeFilter(key)}
              title="Click to remove filter"
            >
              <span>{label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const paginationData = {
    currentPage: page,
    totalPages: Math.ceil(bookingsData.totalCount / limit),
    limit: limit,
    totalCount: bookingsData.totalCount,
  };

  // // Handler for confirming cancellation
  // const handleCancelConfirm = () => {
  //   // TODO: Call your API to cancel booking using selectedBookingId and rejectionRemarks
  //   setIsCancelModalOpen(false);
  //   setRejectionRemarks("");
  //   setSelectedBookingId(null);
  //   // Optionally, refetch bookings here
  // };



  const handleCancelConfirm = async ({ refundAmount, cancellationCharge, cancellationReason }) => {
    try {
      const response = await cancelBookingFrontend({
        bookingId: selectedBookingId,
        cancellationReason,
        refundAmount: userRole === "0" ? refundAmount : bookingDetails?.data?.baseAmount * 0.9,
        cancellationCharge: userRole === "0" ? cancellationCharge : bookingDetails?.data?.baseAmount * 0.1,
        token,
        userRole,
      });
      if (response.success) {
        setIsCancelModalOpen(false);
        setRejectionRemarks("");
        setSelectedBookingId(null);
        await fetchBookings();
        toast.success("Booking cancelled successfully!", { autoClose: 2000 });
      } else {
        toast.error(response.message || "Failed to cancel booking");
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

const handleDownloadReceipt = async (bookingId) => {
  setDownloadingBookingId(bookingId); // start loader
    toast.success("Download started...", { autoClose: 2000 });
  try {
    const response = await fetch(
      `${BASE_API_URL}/api/v1/properties/bookings/${bookingId}/receipt`,
      {
        method: "GET",
        credentials: "include", // cookies handle auth
      }
    );

    if (!response.ok) throw new Error("Failed to download receipt");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_SDA_${bookingId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
     toast.success("Download completed ✅", { autoClose: 2000 });
  } catch (error) {
     toast.error("Download failed ❌");
  } finally {
    setDownloadingBookingId(null);
  }
};
  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white  shadow-sm  p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {/* <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                /> */}
              </svg>
              {/* <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              /> */}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-center text-gray-700 mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter property name"
                />
              </div>
              <div>
                <label className="block text-sm text-center font-medium text-gray-700 mb-1">
                  Booking Purpose
                </label>
                <select
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Purposes</option>
                  {purposes.map((purpose) => (
                    <option key={purpose._id} value={purpose.purpose}>
                      {purpose.purpose}
                    </option>
                  ))}
                </select>
              </div>





              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  value={bookingAmountMin}
                  onChange={(e) => setBookingAmountMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  value={bookingAmountMax}
                  onChange={(e) => setBookingAmountMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {renderFilterChips()}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="bg-white  shadow-sm  overflow-hidden">
          {bookingsData.bookings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>




                    <tr className="border-b border-gray-200 bg-gray-50/50">
   <th className="px-6 py-4 text-center">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        Booking Id
      </span>
    </th>

    <th className="px-6 py-4 text-center">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        Customer Name
      </span>
    </th>
    <th className="px-6 py-4 text-center">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        Email
      </span>
    </th>
    <th className="px-6 py-4 text-center">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        Phone
      </span>
    </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Property Details
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Booking Purpose
                        </span>
                      </th>
                      <th className="px-2 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Booking Date &amp; Time
                        </span>
                      </th>
                      <th className="px-8 py-6 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Booking Date Range
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Booked For Days
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Status
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Amount
                        </span>
                      </th>

                           <th className="px-6 py-4 text-center">
  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
    Download Receipt
  </span>
</th>

                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
CANCELLATION DAYS LEFT                        </span>
                      </th>

  <th className="px-6 py-4 text-center">
      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        Cancellation Details
      </span>
    </th>

                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {bookingsData.bookings.map((booking, index) => {
                      const statusObj = getBookingStatus(booking.bookingStatus);
                      return (
                        <tr
                          key={booking.bookingId}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/25"
                          }`}
                        >

                          <td className="px-6 py-5 text-center">
  {booking. bookingRowIdMongoose|| "-"}
</td>
                          <td className="px-6 py-5 text-center">
  {booking.customerDetails?.name || "-"}
</td>
<td className="px-6 py-5 text-center">
  {booking.customerDetails?.email || "-"}
</td>
<td className="px-6 py-5 text-center">
  {booking.customerDetails?.phone || "-"}
</td>

                          <td className="px-2 py-8">
                            <div className="flex items-center space-x-3">
                              {booking.propertyImageUrl && (
                                <img
                                  src={booking.propertyImageUrl}
                                  alt={booking.propertyName}
                                  className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-left text-gray-900">
                                  {booking.propertyName}
                                </div>
                                <div className="text-xs  text-left text-gray-500">
                                  {booking.location}
                                </div>
                                {/* <div className="text-xs text-left text-gray-400">
                                  PropertyID: {booking.propertyUniqueId}
                                </div> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-center items-center px-2.5 py-1 text-xs text-black-700 ">
                              {booking.bookingPurpose}
                            </div>
                          </td>
                          <td className="px-1 py-1 text-center">
                            <div className="text-xs  text-center text-gray-500">
                              {new Date(booking.bookingCreatedAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(booking.bookingFromDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}{" "}
                              -{" "}
                              {new Date(booking.bookingUptoDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-700">
                              {booking.bookedForDaysCount}{" "}
                              {booking.bookedForDaysCount === 1 ? "day" : "days"}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusObj.color}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusObj.dot}`}
                              ></span>
                              {statusObj.label}
                            </span>
                          </td>
                          <td className="px-2 py-5 text-center">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-gray-900">
                                {convertToINR(booking.bookingAmount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                ₹
                                {Math.round(
                                  booking.bookingAmount / booking.bookedForDaysCount
                                ).toLocaleString("en-IN")}
                                /day
                              </div>
                            </div>
                          </td>





<td className="px-6 py-4 text-center">
  {booking.bookingStatus === "1" || booking.bookingStatus === "4" ? (
    downloadingBookingId === booking.bookingId ? (
      // Small loader instead of GIF
      <div className="flex justify-center items-center">
        <svg
          className="animate-spin h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    ) : (
      <button
        onClick={() => handleDownloadReceipt(booking.bookingId)}
        className="text-blue-600 hover:text-blue-800"
        title="Download Receipt"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
      </button>
    )
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>



                          <td className="px-6 py-5 text-center">
                            <div className="text-center items-center px-2 py-0.5 rounded text-xs  text-gray-700 mt-1">
                              {booking.bookingStatus === "4" ? (
                                "-"
                              ) : (
                                <>
                                  {booking.daysLeftForCancellation}{" "}
                                  {booking.daysLeftForCancellation === 1 ? "day" : "days"}
                                </>
                              )}
                            </div>
                          </td>
                            <td className="px-1 py-1 text-center">
          {booking.bookingStatus === "4" ? (
            <div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {booking.cancelDate
                  ? new Date(booking.cancelDate).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Reason:</span>{" "}
                {booking.cancelReason ? booking.cancelReason : "-"}
              </div>
            </div>
          ) : (
            "-"
          )}
        </td>


<td className="px-6 py-4 text-center">
  {booking.bookingStatus === "4" ? (
    <span className="text-red-700 font-medium">
      Cancelled by {booking.bookingCancelledBy}
    </span>
  ) : booking.bookingStatus === "1" && booking.daysLeftForCancellation >= 0 ? (
    <button
      onClick={() => handleOpenCancelModal(booking.bookingId)}
      className="text-red-700 hover:text-red-800 font-medium"
      disabled={loadingBookingDetails[booking.bookingId]} // Check specific bookingId
    >
      {loadingBookingDetails[booking.bookingId] ? "Loading..." : "Cancel Booking"}
    </button>
  ) : (
    <span className="text-gray-500 text-center italic">
      Cancellation Window Closed.
    </span>
  )}
</td>


                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View omitted for brevity */}
            </>
          )}
        </div>
      )}
      {bookingsData.bookings.length > 0 && (
        <Pagination
          pagination={paginationData}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Modal for cancellation */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setRejectionRemarks("");
          setSelectedBookingId(null);
        }}
        onConfirm={handleCancelConfirm}
        pendingRejectPayload={
          selectedBookingId
            ? [{ fileName: "Booking", fileNumber: selectedBookingId }]
            : []
        }
                token={token}

        bookingId={selectedBookingId}
userRole={userRole}
        rejectionRemarks={rejectionRemarks}
        setRejectionRemarks={setRejectionRemarks}
         bookingDetails={bookingDetails}

      />

    </div>
  );
};

export default AllBookings;
