import apiClient from "./axois";

export const getCsrfToken = async () => {
  try {
    const res = await apiClient.get("/csrf-token");
    return res.data.csrfToken;
  } catch (err) {
    return null;
  }
};
