import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  form: null,
  fields: [],
  loading: false,
  error: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setForm(state, action) {
      state.form = action.payload;
    },
    setFields(state, action) {
      state.fields = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetFormState(state) {
      state.form = null;
      state.fields = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setForm, setFields, setLoading, setError, resetFormState } =
  formSlice.actions;
export default formSlice.reducer;
