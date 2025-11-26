import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axois";
import getCookie from "../../utils/RoleBasedRedirect";

export const cancelBookingFrontend = async ({
  cancellationReason,
  bookingId,
  refundAmount,
  amount_to_be_refunded_after_round_off,
  cancellationCharge,
  // token,
} = {}) => {
  try {
    const payload = {
      cancellationReason,
      bookingId,
      refundAmount,
      cancellationCharge,
      amount_to_be_refunded_after_round_off,
    };

    const response = await apiClient.post(
      `/properties/cancel-booking`,
      payload,
      { withCredentials: true }
    );

    const { data, status } = response;

    if (status === 200 && data?.status === "success") {
      return {
        success: true,
        message: data?.message || "Booking cancelled successfully",
        data: data?.data || null,
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to cancel booking",
        data: null,
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while cancelling booking",
      data: null,
    };
  }
};

export const getBookingDetailsFrontend = async ({ bookingId, token } = {}) => {
  try {
    const payload = { bookingId };

    const response = await apiClient.post(
      `/properties/get-property-booking-details`,
      payload,
      { withCredentials: true }
    );

    const apiData = response.data; // This is your actual JSON body

    if (response.status === 200 && apiData?.status === "success") {
      return {
        success: true,
        message: apiData?.message || "Booking details retrieved successfully",
        data: apiData?.data?.[0] || null, // ✅ use optional chaining
      };
    } else {
      return {
        success: false,
        message: apiData?.message || "Failed to retrieve booking details",
        data: null,
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while retrieving booking details",
      data: null,
    };
  }
};
