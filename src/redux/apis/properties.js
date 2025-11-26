import Cookies from "js-cookie";
import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axois";
import getCookie from "../../utils/RoleBasedRedirect";

export const createPropertyService = async (formDataPayload) => {
  try {
    // 🎯 The frontend already sends properly formatted FormData
    // Just pass it directly to the API - no need to reconstruct!

    // Debug: Log FormData contents

    for (let pair of formDataPayload.entries()) {
    }

    const response = await apiClient.post(
      "/properties/create-properties",
      formDataPayload, // ✅ Use the FormData directly from frontend
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    const { status, data } = response;

    if ((status === 200 || status === 201) && data?.status === "success") {
      const property = data.message;
      return {
        success: true,
        message: "Property created successfully",
        data: {
          id: property._id || property.propertyUniqueId,
          name: property.name,
          address: property.address,
          description: property.description,
          basePrice: property.basePrice,
          isBooked: property.isBooked,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          complete: {
            status: data.status,
            message: property,
            data: data.data,
          },
        },
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to create property",
        data: null,
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message: formattedError?.message || "Something went wrong",
      data: null,
    };
  }
};

export const getAllPropertiesFrontend = async ({
  search = "",
  purposeFlag,
} = {}) => {
  try {
    // Build request payload
    const payload = {};
    if (search) payload.search = search;
    if (purposeFlag !== undefined && purposeFlag !== "")
      payload.purposeFlag = purposeFlag;

    const response = await apiClient.post(
      `/properties/get-all-properties`,
      payload,
      {
        withCredentials: true, // ✅ browser will attach cookie
      }
    );

    const { data, status } = response;

    if (
      status === 200 &&
      data?.status === "success" &&
      Array.isArray(data?.message)
    ) {
      return {
        success: true,
        message: "Properties fetched successfully",
        data: data.message,
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to fetch properties",
        data: [],
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while fetching properties",
      data: [],
    };
  }
};
export const getMyBookedPropertiesFrontend = async ({
  page = 1,
  limit = 10,
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
} = {}) => {
  try {
    // Always send null for missing values
    const requestBody = {
      page,
      limit,
      propertyName: propertyName ?? null,
      bookingPurpose: bookingPurpose ?? null,
      bookingStatus: bookingStatus ?? null,
      bookingCreatedFrom: bookingCreatedFrom ?? null,
      bookingCreatedTo: bookingCreatedTo ?? null,
      bookedFromDateFrom: bookedFromDateFrom ?? null,
      bookedFromDateTo: bookedFromDateTo ?? null,
      bookedUptoDateFrom: bookedUptoDateFrom ?? null,
      bookedUptoDateTo: bookedUptoDateTo ?? null,
      bookingAmountMin: bookingAmountMin ?? null,
      bookingAmountMax: bookingAmountMax ?? null,
    };

    const response = await apiClient.post(
      "/properties/get-my-booked-properties",
      requestBody,
      { withCredentials: true }
    );

    const { data, status } = response;

    if (
      status === 200 &&
      data?.status === "success" &&
      data?.message?.bookings
    ) {
      return {
        success: true,
        message: "Booked properties fetched successfully",
        data: data.message, // { bookings, totalCount, page, limit }
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to fetch booked properties",
        data: null,
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while fetching booked properties",
      data: null,
    };
  }
};

export const getAllBookedPropertiesAdminFrontend = async ({
  page = 1,
  limit = 10,
  propertyName = "",
  bookingPurpose = "",
  bookingStatus = "",
  bookingCreatedFrom = "",
  bookingCreatedTo = "",
  bookedFromDateFrom = "",
  bookedFromDateTo = "",
  bookedUptoDateFrom = "",
  bookedUptoDateTo = "",
  bookingAmountMin = "",
  bookingAmountMax = "",
} = {}) => {
  try {
    const token = Cookies.get("accessToken"); // ✅ correct

    // Prepare request body with filters & pagination
    // Empty strings are allowed; backend will handle empty vs filter presence
    const requestBody = {
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
    };

    const response = await apiClient.post(
      "/properties/get-all-booked-properties-admin", // backend route
      requestBody,

      {
        withCredentials: true, // ✅ just this, browser will attach cookie
      }
    );

    const { data, status } = response;

    if (
      status === 200 &&
      data?.status === "success" &&
      data?.message?.bookings
    ) {
      return {
        success: true,
        message: "Booked properties fetched successfully",
        data: data.message,
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to fetch booked properties",
        data: null,
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while fetching booked properties",
      data: null,
    };
  }
};
