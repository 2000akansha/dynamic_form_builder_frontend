import toast from "react-hot-toast";
import apiClient from "../../utils/axois";
import encryptData from "../../utils/encrypt";

export const saveBookingDetailsPriorPayment =
  (bookingData) => async (dispatch) => {
    try {
      const encryptedAmount = encryptData(bookingData.amount);
      const encryptedBaseAmount = encryptData(bookingData.baseAmount);

      const payload = {
        ...bookingData,
        amount: encryptedAmount,
        baseAmount: encryptedBaseAmount,
      };

      const response = await apiClient.post(
        "payment/save-booking-details-prior-payment",
        payload,
        {
          withCredentials: true,
        }
      );

      const { data } = response;

      if (response.status === 201 && data.success) {
        return { status: "success", bookingId: data.bookingId };
      } else {
        toast.error(data.message || "Booking failed!");
        return { status: "error", message: data.message || "Booking failed" };
      }
    } catch (error) {
      toast.error("Something went wrong while creating booking!");
      return { status: "error", message: error.message || "Booking failed" };
    }
  };
