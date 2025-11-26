import apiClient from "../../utils/axois";
import Cookies from "js-cookie";
import {
  updateUserDetails,
  removeUserDetails,
} from "../slices/userDetailsSlice"; // adjust path
import CryptoJS from "crypto-js";

// redux/apis/otp.js or wherever you keep your APIs
export const sendOtp = (mobileNumber) => async (dispatch) => {
  try {
    const response = await apiClient.post(
      "/user/send-otp",
      { mobileNumber }, // 📤 Body data
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    const errRes = error?.response?.data;

    return {
      success: false,
      message: errRes?.message || "Something went wrong while sending OTP.",
      error: error.message,
    };
  }
};
const LOGIN_HASH_KEY = import.meta.env.VITE_LOGIN_HASH_KEY;

export const sendOtp_login = (mobileNumber) => async (dispatch) => {
  try {
    const timestamp = new Date().toISOString();
    const payload = { mobileNumber, timestamp };

    const hashValues = CryptoJS.HmacSHA256(
      JSON.stringify(payload),
      LOGIN_HASH_KEY
    ).toString(CryptoJS.enc.Hex);

    const finalPayload = { ...payload, hashValues };
    const response = await apiClient.post("/user/sendotp", finalPayload, {
      headers: { "Content-Type": "application/json" },
    });

    const { data } = response;
    return { success: true, ...data };
  } catch (error) {
    const errRes = error?.response?.data;
    return {
      success: false,
      message: errRes?.message || "Something went wrong while sending OTP.",
      error: error.message,
    };
  }
};

export const verifyOtp = (payload) => async (dispatch) => {
  try {
    const timestamp = new Date().toISOString(); // add timestamp
    const payloadWithTimestamp = { ...payload, timestamp };

    const payloadForHash = {
      phoneOtp: payload.phoneOtp,
      phoneNumber: payload.phoneNumber,
      timestamp,
    };

    const hashValues = CryptoJS.HmacSHA256(
      JSON.stringify(payloadForHash),
      LOGIN_HASH_KEY
    ).toString(CryptoJS.enc.Hex);

    const finalPayload = { ...payloadForHash, hashValues };

    const response = await apiClient.post("/user/verify-otp", finalPayload, {
      withCredentials: true,
    });

    const { data } = response;

    if (
      response.status === 200 &&
      data.status === "success" &&
      data.data?.length
    ) {
      const userData = data.data[0];

      const userDetails = {
        username: userData.username || "",
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.phoneNumber || "",
        level: "",
        userId: userData.id,
        userRole: "2",
        accessToken: userData.accessToken,
      };

      dispatch(updateUserDetails(userDetails));

      return { success: true, data: userData };
    } else {
      return {
        success: false,
        message: data.message || "OTP verification failed",
      };
    }
  } catch (error) {
    const errRes = error?.response?.data;
    return {
      success: false,
      message: errRes?.message || "Something went wrong while verifying OTP.",
    };
  }
};

export const verifyOtpSignup = (payload) => async (dispatch) => {
  try {
    const { phoneOtp, mobileNumber } = payload;

    // Call backend verify + login API
    const response = await apiClient.post("/user/verify-signup-otp", {
      phoneOtp,
      phoneNumber: mobileNumber,
    });

    const { data } = response;

    if (
      response.status === 200 &&
      data.status === "success" &&
      data.data?.length > 0
    ) {
      const userData = data.data[0];

      const userDetails = {
        username: userData.username || "",
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.phoneNumber || "",
        level: "",
        userId: userData.id,
        userRole: userData.role,
        accessToken: userData.accessToken,
      };

      dispatch(updateUserDetails(userDetails));

      return {
        success: true,
        data: userData,
      };
    } else {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }
  } catch (error) {
    const errRes = error?.response?.data;
    return {
      success: false,
      message: errRes?.message || "Something went wrong while logging in.",
    };
  }
};
