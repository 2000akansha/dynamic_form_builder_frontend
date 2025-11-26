import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getCookie from "../../utils/RoleBasedRedirect";
import Cookies from "js-cookie";



const Dashboard = () => {
  const navigate = useNavigate();
    const token = Cookies.get("accessToken");  // ✅ correct
  useEffect(() => {
    const isAuthenticated = token || localStorage.getItem("token");

    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/properties"); // ✅ fixed syntax
    }
  }, [navigate, token]);

  return
};

export default Dashboard;
