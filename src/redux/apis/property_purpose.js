import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axois";

export const getAllPurposeFrontend = async () => {
  try {
    const response = await apiClient.get(
      "/properties/get-all-purpose",

      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
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
        message: "Purposes fetched successfully",
        data: data.message,
      };
    } else {
      return {
        success: false,
        message: data?.message || "Failed to fetch purposes",
        data: [],
      };
    }
  } catch (error) {
    const formattedError = handleApiError(error);
    return {
      success: false,
      message:
        formattedError?.message ||
        "Something went wrong while fetching purposes",
      data: [],
    };
  }
};
