  import { useEffect,useState } from "react";
  import { useNavigate } from "react-router-dom";
  // import getCookie from "../../utils/RoleBasedRedirect";
  import React from "react";
  import Cookies from "js-cookie";
  import { getAllPropertiesFrontend } from "../../redux/apis/properties";
  import {
    Building2,
    MapPin,
    Users,
    Search,
    Grid3X3,
    List,
    Download,
    Eye,
    Calendar,
    IndianRupee,
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    FileText,
    Camera,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Star,
    Building,
    Home
  } from 'lucide-react';
  import { getAllPurposeFrontend } from "../../redux/apis/property_purpose";
  import Header from "../../components/Header";
  import HeaderWithLoginSignUpButton from "../../components/HeaderWithLoginSignUpButton";
  import LoginModal from "../../components/LoginModal";
  import { useSelector } from "react-redux";
import getCookie from "../../utils/RoleBasedRedirect";

const normalizePurpose = (str) => {
  return str
    ?.toLowerCase()
    .replace(/[\s-]+/g, "");
};


const PropertiesListing = () => {
  const navigate = useNavigate();


const { accessToken } = useSelector(
  (state) => state.userDetailsSlice.details || {}
);

const token = accessToken;

  const userRoleFromRedux = useSelector(
    (state) => state.userDetailsSlice.details.userRole
  );
  const userRole = userRoleFromRedux || getCookie("role") || null;

  const [properties, setProperties] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedPurposePrice, setSelectedPurposePrice] = useState(null);
  const [selectedPurposes, setSelectedPurposes] = useState({});
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

  // New state for notice box expansion
  const [noticeExpanded, setNoticeExpanded] = useState(false);








useEffect(() => {
  // const token = Cookies.get("accessToken") || localStorage.getItem("token");

  if (token) {
    // Check if there is any pending booking
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking) {
      const bookingData = JSON.parse(pendingBooking);

      // Ensure we also pass tax rules + selectedPurpose like in normal Book Now
      navigate(`/home/book-my-properties/${bookingData.propertyId}`, {
        state: {
          property: bookingData.property,
          hideHeader: true,
          selectedPurpose: bookingData.selectedPurpose,
          propertyRule: bookingData.property?.propertyRule || null, // ✅ tax rules included
          termsCondition: bookingData.property?.termsCondition || null, // ✅ extra info
        },
      });

      // Remove pending booking so it doesn't trigger again
      localStorage.removeItem("pendingBooking");
    }
  }
}, [token,navigate]);


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

  const ruleToSentence = (key, value) => {
    switch (key) {
            case "stayDuration":

      case "reservationPeriod":
        return `Reservation period for each property is ${value} days.`;
      // case "stayDuration":
      //   return `Maximum stay allowed is ${value} days.`;
      case "cancelWindow":
        return `Cancellation on or before 30 days of booking will charge 10% deduction and 90% refund.`;
      case "taxPercentage":
        return `Tax rate applicable on bookings is ${value}%.`;
      case "bookingWindow":
        return `Future booking window for each property is ${value} days.`;
      default:
        return `${key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())}: ${value}`;
    }
  };

  const allPropertyRuleSentences = React.useMemo(() => {
    const sentences = [];
    properties.forEach((p) => {
      if (p.propertyRule && typeof p.propertyRule === "object") {
        Object.entries(p.propertyRule).forEach(([key, value]) => {
          if (
            key !== "_id" &&
            key !== "createdAt" &&
            key !== "updatedAt" &&
            key !== "__v" &&
            key !== "status" &&
            key !== "updateMasterId" &&
            key !== "isDeleted"
          ) {
            sentences.push(ruleToSentence(key, value));
          }
        });
      }
    });
    return Array.from(new Set(sentences));
  }, [properties]);

  useEffect(() => {
    // const isAuthenticated = token || localStorage.getItem("token");

    const isAuthenticated = !!token;

    if (!isAuthenticated) {
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { search: searchTerm };
        if (filterPurpose !== "all") {
          params.purposeFlag = filterPurpose;
        }

        const res = await getAllPropertiesFrontend(params);

        if (res.success && Array.isArray(res.data)) {
          setProperties(res.data);
          const initialSelections = {};
          res.data.forEach((property) => {
            if (Array.isArray(property.purposeType) && property.purposeType.length > 0) {
              initialSelections[property._id] = property.purposeType[0];
            }
          });
          setSelectedPurposes(initialSelections);
          setError("");
        } else {
          setError(res.message || "Failed to load properties");
          setProperties([]);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, filterPurpose]);

  const filteredProperties = properties.filter((property) => {
    if (filterPurpose === "all") return true;
    return property.purposeType?.some(
      (item) => normalizePurpose(item.purpose) === filterPurpose
    );
  });

  const getStatusBadge = (isBooked) => {
    const normalizedBooked = isBooked === true || isBooked === "true";
    const statusConfig = {
      false: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Available",
      },
      true: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        label: "Occupied",
      },
    };
    const config = statusConfig[normalizedBooked];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePurposeFilterChange = (e) => {
    const selectedValue = e.target.value;
    setFilterPurpose(selectedValue);
  };

  const openImageModal = (images, index = 0) => {
    setImageModal({ open: true, images, currentIndex: index });
  };

  const closeImageModal = () => {
    setImageModal({ open: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">Loading Properties...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we fetch the latest data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ALL PROPERTIES</h1>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-96">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="border-b-2 border-b-gray-200">{!token && <HeaderWithLoginSignUpButton />}</div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-15 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Community Halls</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* GRID/LIST TOGGLE */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500"
                  }`}
                  aria-label="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500"
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">{/* Search box can go here if needed */}</div>

            <select
              value={filterPurpose}
              onChange={handlePurposeFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
              aria-label="Filter by Purpose"
            >
              <option value="all">All Purposes</option>
              {purposes.map((purpose) => (
                <option key={purpose._id} value={normalizePurpose(purpose.purpose)}>
                  {purpose.purpose}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties
              {filterPurpose !== "all" && ` filtered by purpose`}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Notice Box */}
      {allPropertyRuleSentences.length > 0 && (
        <div
 className="fixed bottom-20 right-8 z-50 max-w-xs w-80 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-lg flex flex-col"
          style={{
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 cursor-pointer select-none" onClick={() => setNoticeExpanded((v) => !v)} aria-expanded={noticeExpanded} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setNoticeExpanded((v) => !v); }}>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-yellow-800 text-sm">Important Notice</span>
            </div>
            <button
              aria-label={noticeExpanded ? "Collapse Notice" : "Expand Notice"}
              className="text-yellow-700 font-bold text-lg leading-none select-none focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setNoticeExpanded((v) => !v);
              }}
            >
              {noticeExpanded ? "−" : "+"}
            </button>
          </div>
          <div
            className={`px-4 transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
              noticeExpanded ? "max-h-52 opacity-100" : "max-h-0 opacity-0"
            }`}
            style={{ scrollbarWidth: "thin" }}
          >
            <ul className="list-disc list-inside text-yellow-900 text-xs max-h-40 overflow-y-auto pl-2">
              {allPropertyRuleSentences.map((sentence, index) => (
                <li key={index}>{sentence}</li>
              ))}
            </ul>
            <span className="block mt-2 text-yellow-700 italic text-xs">
              Please read before booking.
            </span>
          </div>
        </div>
      )}

      {/* Properties Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterPurpose !== "all"
                ? "Try adjusting your search criteria or filters."
                : "No properties are currently available in the system."}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Image Section */}
                <div
                  className={`relative ${
                    viewMode === "list" ? "w-48 flex-shrink-0" : "w-full"
                  }`}
                >
                  <img
                    src={property.photoURL?.[0] || "/jk.jpeg"}
                    alt={property.name}
                    className={`object-cover ${
                      viewMode === "list" ? "w-full h-full" : "w-full h-48"
                    }`}
                    onClick={() =>
                      openImageModal(property.photoURL || ["/jk.jpeg"], 0)
                    }
                    crossOrigin="anonymous"
                  />

                  {property.photoURL && property.photoURL.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Camera className="w-3 h-3 mr-1" />
                      {property.photoURL.length}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-lg font-semibold text-gray-900 truncate pr-2"
                      title={property.name}
                    >
                      {property.name}
                    </h3>

                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Property ID: {property.propertyUniqueId}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{property.address}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{property.capacity} capacity</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-4 bg-gray-50 border border-gray-200 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-line">
                    {property.description}
                  </div>

                  {/* PurposeType Bubbles */}
                  {Array.isArray(property.purposeType) &&
                    property.purposeType.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.purposeType.map((item, idx) => {
                          const isSelected =
                            selectedPurposes[property._id]?.purpose === item.purpose;

                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                setSelectedPurposes((prev) => ({
                                  ...prev,
                                  [property._id]: item,
                                }))
                              }
                              className={`text-sm px-3 py-1 rounded-full border transition duration-200 shadow-sm ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-700"
                                  : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                              }`}
                            >
                              {item.purpose}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {property.termsCondition && (
                    <div className="mb-4">
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>Terms & Conditions</span>
                      </div>
                      <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-line">
                        {property.termsCondition}
                      </div>
                    </div>
                  )}

                  {property.property_rule && property.property_rule.trim() !== "" && (
                    <div className="mb-4">
                      <div className="flex items-center text-xs text-yellow-700 mb-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span>Property Rule</span>
                      </div>
                      <div className="text-xs text-yellow-900 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-line">
                        {property.property_rule}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    {/* Price */}
                    <div className="flex items-center text-blue-600 font-bold">
                      <span>
                        ₹
                        {selectedPurposes[property._id]?.purposePrice?.toLocaleString(
                          "en-IN"
                        ) || property.basePrice?.toLocaleString("en-IN")}
                      </span>
                      <span className="flex items-center text-blue-600 font-bold">
                        / day
                      </span>
                    </div>
                    {loginModalOpen && (
                      <LoginModal onClose={() => setLoginModalOpen(false)} />
                    )}

                    {/* {userRole !== "0" && (
                      <button
                        onClick={() => {
                          if (!token) {
                            navigate("/login");
                          } else {
                            navigate(`/home/book-my-properties/${property._id}`, {
                              state: {
                                property,
                                hideHeader: true,
                                selectedPurpose: selectedPurposes[property._id],
                              },
                            });
                          }
                        }}
                        className="ml-3 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        Book Now
                      </button>
                    )} */}






{userRole !== "0" && (
  <button
    onClick={() => {
      // if (!token) {
      //   // Store the booking intent in localStorage before redirecting to login
      //   const bookingIntent = {
      //     propertyId: property._id,
      //     property: property,
      //     selectedPurpose: selectedPurposes[property._id],
      //     timestamp: Date.now()
      //   };
      //   localStorage.setItem('pendingBooking', JSON.stringify(bookingIntent));
      //   navigate("/login");
      // } else {
      //   navigate(`/home/book-my-properties/${property._id}`, {
      //     state: {
      //       property,
      //       hideHeader: true,
      //       selectedPurpose: selectedPurposes[property._id],
      //     },
      //   });
      // }


      if (!token) {
  // Store the booking intent in localStorage before redirecting to login
  const bookingIntent = {
    propertyId: property._id,
    property: property,
    selectedPurpose: selectedPurposes[property._id],
    timestamp: Date.now(),
  };
  localStorage.setItem("pendingBooking", JSON.stringify(bookingIntent));
  navigate("/login");
} else {
  navigate(`/home/book-my-properties/${property._id}`, {
    state: {
      property,
      hideHeader: true,
      selectedPurpose: selectedPurposes[property._id],
      propertyRule: property.propertyRule || null, // ✅ tax rules
      termsCondition: property.termsCondition || null,
    },
  });
}

    }}
    className="ml-3 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
  >
    Book Now
  </button>
)}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created: {formatDate(property.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close Image Modal"
            >
              <AlertCircle className="w-6 h-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex space-x-2 z-10">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200"
                aria-label="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 1))}
                className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200"
                aria-label="Zoom Out"
              >
                −
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200"
                aria-label="Reset Zoom"
              >
                Reset
              </button>
            </div>

            {/* Image with Zoom and Drag */}
            <div
              className="cursor-grab active:cursor-grabbing"
              style={{ width: "1500px" }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX - offset.x;
                const startY = e.clientY - offset.y;
                const onMouseMove = (ev) => {
                  setOffset({
                    x: ev.clientX - startX,
                    y: ev.clientY - startY,
                  });
                };
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            >
              <img
                src={imageModal.images[imageModal.currentIndex]}
                alt="Property"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: "transform 0.1s ease-out",
                  width: "50%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  userSelect: "none",
                }}
                draggable={false}
              />
            </div>

            {/* Left/Right Navigation */}
            {imageModal.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {imageModal.currentIndex + 1} / {imageModal.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

  export default PropertiesListing;
