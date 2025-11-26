import React, { useState, useRef } from "react";
import { FiHome, FiMapPin, FiDollarSign, FiUsers, FiFileText, FiCheckCircle, FiX, FiPlus, FiUpload, FiTrash2, FiStar } from "react-icons/fi";
import { createPropertyService } from "../../redux/apis/properties"; // Your direct API service
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    capacity: "",
    termsCondition: "",
    status: "1",
    purposes: [],
    photo: [],
  });

  // Input change handler
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Photo input handler
  // const handleFileChange = (e) => {
  //   const filesArray = Array.from(e.target.files);
  //   setFormData((prev) => ({ ...prev, photo: [...prev.photo, ...filesArray] }));
  // };



  // Photo input handler with validations

const handleFileChange = (e) => {
  const filesArray = Array.from(e.target.files);
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  const maxSize = 2 * 1024 * 1024; // 2MB
  const maxPhotos = 5;

  let validFiles = [];
  let typeOrSizeError = false;

  // Validate type and size
  for (let file of filesArray) {
    if (!allowedTypes.includes(file.type)) {
      typeOrSizeError = true;
      continue;
    }
    if (file.size > maxSize) {
      typeOrSizeError = true;
      continue;
    }
    validFiles.push(file);
  }

  const currentPhotoCount = formData.photo.length;
  const totalAfterAdd = currentPhotoCount + validFiles.length;

  // If total photos exceed max, show toast ONLY
  if (totalAfterAdd > maxPhotos) {
    toast.error(`❌ Maximum ${maxPhotos} photos allowed. Please remove some photos first.`);
    e.target.value = ""; // reset input
    return; // DO NOT add any files
  }

  // If any type/size error, show toast ONLY
  if (typeOrSizeError) {
    toast.error(`❌ Some files are invalid. Only PNG, JPG, JPEG under 2MB are allowed.`);
  }

  // Add valid files
  if (validFiles.length > 0) {
    setFormData((prev) => ({ ...prev, photo: [...prev.photo, ...validFiles] }));
  }

  e.target.value = ""; // reset input
};



  // Remove photo by index
  // const handleRemovePhoto = (index) => {
  //   setFormData((prev) => {
  //     const updatedPhotos = [...prev.photo];
  //     updatedPhotos.splice(index, 1);
  //     return { ...prev, photo: updatedPhotos };
  //   });
  // };
// Remove photo by index - ENHANCED VERSION
const handleRemovePhoto = (index) => {
  setFormData((prev) => {
    const updatedPhotos = [...prev.photo];
    updatedPhotos.splice(index, 1);
    return { ...prev, photo: updatedPhotos };
  });

  // Clear any photo-related errors when removing photos
  setError(null);
};
  // Purposes management
  const handleAddPurpose = () => {
    setFormData((prev) => ({
      ...prev,
      purposes: [
        ...prev.purposes,
        { purpose: "", purposePrice: "", purposeStatus: "0" },
      ],
    }));
  };

  const handleRemovePurpose = (index) => {
    setFormData((prev) => {
      const updatedPurposes = [...prev.purposes];
      updatedPurposes.splice(index, 1);
      return { ...prev, purposes: updatedPurposes };
    });
  };

  const handlePurposeChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedPurposes = [...prev.purposes];
      updatedPurposes[index][field] = value;
      return { ...prev, purposes: updatedPurposes };
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const isEmpty = (val) =>
    val === undefined || val === null || (typeof val === "string" && val.trim() === "");

  const checkLength = (val, min, max) => val.length < min || val.length > max;

  const basicFields = ["name", "address", "description", "capacity", "termsCondition"];

  for (let field of basicFields) {
    const value = formData[field]?.trim();
    if (isEmpty(value)) {
      toast.error(`❌ Field "${field}" is required.`, { autoClose: 5000 });
      setLoading(false);
      return;
    }

    switch (field) {
      case "name":
        if (checkLength(value, 3, 50)) {
          toast.error("❌ Property name must be between 3 and 50 characters.", { autoClose: 5000 });
          setLoading(false);
          return;
        }
        break;
      case "address":
        if (checkLength(value, 3, 200)) {
          toast.error("❌ Address must be between 3 and 200 characters.", { autoClose: 5000 });
          setLoading(false);
          return;
        }
        break;
      case "description":
        if (checkLength(value, 3, 300)) {
          toast.error("❌ Description must be between 3 and 300 characters.", { autoClose: 5000 });
          setLoading(false);
          return;
        }
        break;
      case "termsCondition":
        if (checkLength(value, 3, 500)) {
          toast.error("❌ Terms & Conditions must be between 3 and 500 characters.", { autoClose: 5000 });
          setLoading(false);
          return;
        }
        break;
      case "capacity":
        const numCapacity = Number(value);
        if (isNaN(numCapacity) || numCapacity < 1) {
          toast.error("❌ Capacity must be a positive number.", { autoClose: 5000 });
          setLoading(false);
          return;
        }
        break;
      default:
        break;
    }
  }

  // Purposes validation
  if (!formData.purposes || formData.purposes.length === 0) {
    toast.error("❌ Add at least 1 purpose.", { autoClose: 5000 });
    setLoading(false);
    return;
  }

  for (let i = 0; i < formData.purposes.length; i++) {
    const p = formData.purposes[i];
    if (isEmpty(p.purpose) || isEmpty(p.purposePrice)) {
      toast.error(`❌ Fill all details for Purpose #${i + 1}.`, { autoClose: 5000 });
      setLoading(false);
      return;
    }
  }

  // Photos validation
  if (!formData.photo || formData.photo.length === 0) {
    toast.error("❌ Add at least 1 photo.", { autoClose: 5000 });
    setLoading(false);
    return;
  }

  try {
    const payload = new FormData();
    basicFields.forEach((field) => payload.append(field, formData[field]));
    payload.append("status", formData.status);

    formData.purposes.forEach((purpose, idx) => {
      payload.append(`purposes[${idx}][purpose]`, purpose.purpose);
      payload.append(`purposes[${idx}][purposePrice]`, purpose.purposePrice);
      payload.append(`purposes[${idx}][purposeStatus]`, purpose.purposeStatus || "0");
    });

    formData.photo.forEach((file) => payload.append("photo", file));

    const result = await createPropertyService(payload);

    // ✅ Check if backend returned success
  if (!result?.success) {
      toast.error(result?.message || "❌ Failed to create property. Please try again.", {
        autoClose: 8000,
      });
      setLoading(false);
      return; // DO NOT navigate
    }

    // Reset form on success
    setFormData({
      name: "",
      address: "",
      description: "",
      capacity: "",
      termsCondition: "",
      status: "1",
      purposes: [],
      photo: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";

   toast.success("✅ Property created successfully!");
navigate("/home/my-properties", {
  state: {
    message: "Property created successfully!",
    propertyId: result?.message?._id,
  },
});

  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "❌ Failed to create property. Please try again.";
    toast.error(msg, { autoClose: 8000 });
    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen  px-6 py-12 sm:px-10 md:px-16 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg"
            aria-hidden="true"
          >
            <FiHome className="text-secondary text-4xl" />
          </div>
          <h1 className="mt-4 text-5xl font-extrabold text-primary tracking-wide font-sans">
            Create New Property
          </h1>

        </div>

        {/* Card Container */}
        <div className=" rounded-3xl border border-secondary2 p-10 shadow-lg">
          {/* Card Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary font-sans mb-1">
              Property Details
            </h2>
            <p className="text-primary2 font-semibold font-serif">
              Fill in all required information below
            </p>
          </div>

          {/* Status messages */}
          {loading && (
            <div className="mb-6 p-4 bg-primary2 rounded-xl border border-primary2 flex items-center justify-center space-x-3 font-semibold text-primary">
              <svg
                className="animate-spin h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Creating property...</span>
            </div>
          )}

          {error && (
            <div
              className="mb-6 p-4 bg-primary2 rounded-xl border border-primary2 flex items-center space-x-3 font-semibold text-primary"
              role="alert"
            >
              <FiX className="w-6 h-6" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Property Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Property Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  className="custom-input"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  className="custom-input"
                />
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Capacity
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="text"
                  required
                  min={1}
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Number of guests"
                  className="custom-input"
                />
              </div>

              {/* Base Price */}
              {/* <div>
                <label
                  htmlFor="basePrice"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Base Price (₹)
                </label>
                <input
                  id="basePrice"
                  name="basePrice"
                  type="text"
                  required
                  min={0}
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="custom-input"
                />
              </div> */}

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your property..."
                  className="custom-input resize-none"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="md:col-span-2">
                <label
                  htmlFor="termsCondition"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Terms & Conditions
                </label>
                <textarea
                  id="termsCondition"
                  name="termsCondition"
                  rows={4}
                  required
                  value={formData.termsCondition}
                  onChange={handleChange}
                  placeholder="Enter terms and conditions..."
                  className="custom-input resize-none"
                />
              </div>

              {/* Purposes Section */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-primary font-sans flex items-center space-x-2">
                    <FiStar className="text-primary2 w-6 h-6" />
                    <span>Property Purposes</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddPurpose}
                    className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary2 transition-colors"
                  >
                    <FiPlus className="mr-2" /> Add Purpose
                  </button>
                </div>

                {formData.purposes.length > 0 ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                    {formData.purposes.map((p, i) => (
                      <div
                        key={i}
                        className=" rounded-lg border border-secondary2 p-6 shadow"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-primary font-semibold text-xl font-sans">
                            Purpose #{i + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleRemovePurpose(i)}
                            className="text-primary hover:text-primary2 transition-colors"
                            aria-label={`Remove purpose ${i + 1}`}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input
                            type="text"
                            placeholder="Purpose Name (e.g. Wedding, Conference)"
                            value={p.purpose}
                            onChange={(e) =>
                              handlePurposeChange(i, "purpose", e.target.value)
                            }
                            className="custom-input"
                          />
                          <input
                            type="text"
                            min={0}
                            step="0.01"
                            placeholder="Price (₹)"
                            value={p.purposePrice}
                            onChange={(e) =>
                              handlePurposeChange(i, "purposePrice", e.target.value)
                            }
                            className="custom-input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16  border-2 border-dashed border-secondary2 rounded-lg text-primary2 font-semibold select-none font-sans">
                    <FiStar className="mx-auto mb-4 w-10 h-10" />
                    No purposes added yet. Click "Add Purpose" to define special purposes with pricing.
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-primary font-semibold mb-2 text-lg font-sans"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="custom-input  cursor-pointer"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              {/* Photo upload */}
              <div className="md:col-span-2">
                <label
                  htmlFor="file-upload"
                  className="block text-primary font-semibold mb-3 text-lg font-sans"
                >
                  Property Photos
                </label>
                <div
                  className="flex flex-col items-center justify-center border-4 border-dashed border-secondary2 rounded-xl  p-8 cursor-pointer hover:border-secondary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload className="w-12 h-12 text-primary2 mb-3" />
                  <p className="text-primary font-semibold mb-1 font-sans">
                    Click or drag and drop to upload photos
                  </p>
                  <p className="text-primary2 text-sm mb-6 font-serif">
                    PNG, JPG, JPEG up to 2MB each (Max 5 photo)
                  </p>
                  {/* <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  /> */}
<input
  id="file-upload"
  type="file"
  multiple
  accept="image/png, image/jpeg, image/jpg"
  onChange={handleFileChange}
  ref={fileInputRef}
  className="hidden"
/>

                  {formData.photo.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 justify-center max-w-full">
                      {formData.photo.map((file, idx) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div
                            key={idx}
                            className="relative w-28 h-28 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <img
                              src={url}
                              alt={`Property preview ${idx + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                                URL.revokeObjectURL(url);
                              }}
                              className="absolute top-1 right-1 bg-primary rounded-full p-1 hover:bg-primary2 transition-colors text-secondary"
                              aria-label={`Remove photo ${idx + 1}`}
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-xl font-extrabold text-white text-2xl shadow-md transition-transform transform ${
                  loading
                    ? "bg-primary2 cursor-not-allowed"
                    : "bg-primary hover:bg-primary2 hover:-translate-y-1 cursor-pointer"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <svg
                      className="animate-spin h-6 w-6 text-secondary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating Property...</span>
                  </div>
                ) : (
                  "Create Premium Property"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



export default CreatePropertyPage;