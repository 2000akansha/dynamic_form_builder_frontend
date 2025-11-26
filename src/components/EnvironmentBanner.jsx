import React from "react";

const getEnvLabel = () => {
  const url = import.meta.env.VITE_BASE_URL;

  if (url === "http://localhost:1059") {
    return <div>Dev Environment</div>;
  } else if (url === "https://sdajk.erent.co.in:1016") {
    return <div>UAT Environment</div>;
  } else {
    return <div>Unknown Environment</div>; // fallback
  }
};

const EnvironmentBanner = () => (
  <div className="w-full bg-red-700 text-white text-5xl font-bold py-7 text-center shadow-lg z-50">
    {getEnvLabel()}
  </div>
);

export default EnvironmentBanner;
