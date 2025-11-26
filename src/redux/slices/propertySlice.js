// redux/slices/propertySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for creating property
export const createProperty = createAsyncThunk(
  "property/createProperty",
  async (propertyData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append regular fields
      for (const key of Object.keys(propertyData)) {
        if (key !== "photos" && key !== "purposes") {
          formData.append(key, propertyData[key]);
        }
      }

      // Append photos (array of files)
      if (propertyData.photos && propertyData.photos.length > 0) {
        propertyData.photos.forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      // Append purposes (array of strings or IDs)
      if (propertyData.purposes && propertyData.purposes.length > 0) {
        propertyData.purposes.forEach((purpose) => {
          formData.append("purposes", purpose);
        });
      }

      // API call
      const response = await axios.post(
        "http://localhost:5000/api/properties", // 👈 change to your backend route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data; // success payload
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create property"
      );
    }
  }
);

// Slice
const propertySlice = createSlice({
  name: "property",
  initialState: {
    property: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPropertyState: (state) => {
      state.property = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
        state.error = null;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearPropertyState } = propertySlice.actions;
export default propertySlice.reducer;
