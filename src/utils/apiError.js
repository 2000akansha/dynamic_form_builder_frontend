import Cookies from "js-cookie";

// Common error handling function
// export const handleApiError = async (error) => {
//   if (error.response) {
//     // If gets a action to logout the user
//     if (error.response.data.action === 'LOGOUT_USER') {
//       Cookies.remove('accessToken');
//       setTimeout(() => {
//         window.location.href = '/';
//       }, 2000);
//     }

//     // If there's a response from the server
//     if (
//       error.response.data.success === false ||
//       error.response.data.status === false
//     ) {
//       return error.response.data;
//     } else if (error.response.data.text) {
//       // Handle error in case of blob
//       const errorText = await error.response.data.text();
//       if (errorText) {
//         return JSON.parse(errorText);
//       }
//     } else {
//       return {
//         success: false,
//         message: 'An unknown error occurred.',
//       };
//     }
//   } else {
//     // If there's no response (network error, etc.)
//     return {
//       success: false,
//       message: 'Internal server error. Please try again later.',
//     };
//   }
// };

// ✅ Unified error handler
export const handleApiError = async (error) => {
  const { response } = error;

  if (response) {
    const { data, status } = response;

    // 🧼 Force logout if flagged by backend
    if (data?.action === "LOGOUT_USER") {
      Cookies.remove("accessToken");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }

    if (data?.success === false || data?.status === false) {
      return {
        ...data,
        success: false, // always standardize
      };
    }

    if (data instanceof Blob && data.type === "application/json") {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          success: false,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to parse server response.",
        };
      }
    }

    return {
      success: false,
      message: data?.message || "An unknown server error occurred.",
    };
  }

  return {
    success: false,
    message: "⚠️ Internal server/network error. Please try again later.",
  };
};
