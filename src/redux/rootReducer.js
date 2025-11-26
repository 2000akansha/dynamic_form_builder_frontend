// redux/rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import loadingSlice from "./slices/loadingSlice";
import userDetailsSlice from "./slices/userDetailsSlice";
import propertySlice from "./slices/propertySlice";
import formSlice from "./slices/formSlice";

const rootReducer = combineReducers({
  loadingSlice, // <--- Renamed for clarity (optional, but good practice)
  userDetailsSlice,
  propertySlice,
  formSlice,
});

export default rootReducer;
