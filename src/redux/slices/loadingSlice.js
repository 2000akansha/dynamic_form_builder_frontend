import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loader: false,
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loader = true;
    },
    stopLoading: (state) => {
      state.loader = false;
    },
  },
});

export const { startLoading, stopLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
