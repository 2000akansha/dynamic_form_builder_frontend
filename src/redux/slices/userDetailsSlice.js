import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: {
    username: "",
    name: "",
    email: "",
    mobile: "",
    level: "",
    userId: "",
    userRole: "",
    accessToken: "",
  },
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    updateUserDetails: (state, action) => {
      state.details = action.payload;
    },
    removeUserDetails: (state) => {
      state.details = {
        username: "",
        name: "",
        email: "",
        mobile: "",
        level: "",
        userId: "",
        userRole: "",
        accessToken: "",
      };
    },
    setAccessToken: (state, action) => {
      state.details.accessToken = action.payload;
    },
  },
});

export const { updateUserDetails, removeUserDetails, setAccessToken } =
  userDetailsSlice.actions;
export default userDetailsSlice.reducer;
