// Function to set userRole
export const setUserRole = (role) => {
  if (role === "0") {
    return "Superadmin";
  } else if (role === "2") {
    return "Customer";
  } else {
    return "Customer";
  }
};
