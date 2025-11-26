import Cookies from "js-cookie";
import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axois";
import {
  removeUserDetails,
  updateUserDetails,
} from "../slices/userDetailsSlice";
import encryptData from "../../utils/encrypt";
import CryptoJS from "crypto-js";

export const userLogin = (params) => async (dispatch) => {
  dispatch(removeUserDetails());
  try {
    // 1️⃣ Prepare original payload
    const timestamp = new Date().toISOString(); // add timestamp
    const payload = {
      username: encryptData(params.username),
      password: encryptData(params.password),
      role: params.role,
      captchaToken: params.captchaToken,
      timestamp, // <-- include timestamp
    };

    // 2️⃣ Compute hash of payload with secret key
    const payloadString = JSON.stringify(payload);
    const hashValues = CryptoJS.HmacSHA256(
      payloadString,
      import.meta.env.VITE_LOGIN_HASH_KEY
    ).toString(CryptoJS.enc.Hex);

    // 3️⃣ Send payload + hash to backend
    const finalPayload = { ...payload, hashValues };

    const response = await apiClient.post("/user/login", finalPayload, {
      withCredentials: true,
      headers: { skipAuth: true },
    });

    const { data } = response;

    // 4️⃣ Check backend response status
    if (response.status === 200 && data.status === "success") {
      const returnedHash = data.data[0]?.responseHash;

      // 5️⃣ Recompute hash locally (must include timestamp too!)
      const localHashCheck = CryptoJS.HmacSHA256(
        payloadString,
        import.meta.env.VITE_LOGIN_HASH_KEY
      ).toString(CryptoJS.enc.Hex);

      if (returnedHash !== localHashCheck) {
        return {
          success: false,
          message: "Login process has been tampered.",
        };
      }

      // ✅ Hash matches → process user data normally
      const userData = data.data[0]; // first object from array

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

export const userSignup = (params) => async (dispatch) => {
  try {
    // No need to removeUserDetails here since we're not logging out the user

    const payload = {
      name: params.name,
      customerType: params.customerType,
      email: params.email,
      phoneNumber: params.phoneNumber,
      bankAccountNumber: params.bankAccountNumber,
      ifscCode: params.ifscCode,
      bankName: params.bankName,
      accountHolderName: params.accountHolderName,
      GSTNumber: params.GSTNumber,
      businessName: params.businessName,
      status: params.status || "0",
    };

    const response = await apiClient.post("/user/sign-up", payload, {});

    const { data } = response;

    if (response.status === 201 && data.status === "success") {
      // You can show a toast or redirect
      return { status: "success", data: data.data };
    } else {
      return { status: "error", message: data.message || "Signup failed" };
    }
  } catch (error) {
    return handleApiError(error);
  }
};

export const changePassword = (params) => async (dispatch) => {
  try {
    const payload = {
      currentPassword: encryptData(params.currentPassword),
      newPassword: encryptData(params.newPassword),
      confirmPassword: encryptData(params.confirmPassword), // ✅ Add this line
    };
    const response = await apiClient.post("/user/change-password", payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Change Password API
export const resetPassword = (params) => async (dispatch) => {
  try {
    const payload = {
      token: params.token,
      newPassword: encryptData(params.newPassword),
    };
    const response = await apiClient.post("/pass/reset-password", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendLink = (payload) => async (dispatch) => {
  try {
    const response = await apiClient.post(
      "/pass/send-reset-password-link",
      payload
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Captcha API
export const fetchCaptcha = async () => {
  try {
    const response = await apiClient.post(
      "/generate-captcha",
      { generate: "captcha" },
      {
        headers: {
          skipAuth: true,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
export const userLogout = () => async (dispatch, getState) => {
  try {
    const { accessToken } = getState().userDetailsSlice.details || {};
    const token = accessToken;

    try {
      await apiClient.post(
        "/user/logout",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true, // send refreshToken cookie as well
        }
      );
    } catch (error) {}

    // ✅ Local cleanup
    dispatch(removeUserDetails());
    window.location.href = "/index";

    return { success: true, message: "Logout successful" };
  } catch (err) {
    dispatch(removeUserDetails());
    window.location.href = "/index";
    return { success: false, message: "Logout completed with fallback" };
  }
};
