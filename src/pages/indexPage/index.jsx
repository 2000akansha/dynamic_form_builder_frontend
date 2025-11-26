import { useNavigate } from "react-router-dom";
import CONSTANTS from "../../constants.json";



const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col justify-between items-center bg-no-repeat"
      style={{
        backgroundImage: `url('/SDA_index_page.png')`,
        backgroundSize: "cover",
        backgroundPosition: "top center", // Top fixed
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-25"></div>

      {/* Project Name on Top */}
      <div className="relative z-10 mt-12 text-white font-bold text-4xl drop-shadow-lg uppercase text-center">
        {CONSTANTS.PROJEC_NAME}
      </div>

      {/* Buttons Section */}
    <div className="relative z-10 mb-20 flex flex-col sm:flex-row gap-20">
  {/* <button
    onClick={() => navigate("/properties")}
    className="px-16 py-7 rounded-3xl bg-white/85 backdrop-blur-lg shadow-2xl text-2xl font-bold text-gray-900 hover:bg-white hover:scale-110 transform transition-all duration-300"
  >
    Admin
  </button> */}

  <button
    onClick={() => navigate("/properties")}
    className="px-16 py-7 rounded-3xl bg-white/85 backdrop-blur-lg shadow-2xl text-2xl font-bold text-gray-900 hover:bg-white hover:scale-110 transform transition-all duration-300"
  >
    Customer
  </button>

      </div>
    </div>
  );
};







export default IndexPage;
