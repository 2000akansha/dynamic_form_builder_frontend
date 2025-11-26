import React, { useState } from "react";
import OrderReportPage from "./OrderReportPage";
import OtpReportPage from "./OtpReportPage"; // ✅ import your new OTP utility

const UtilitiesPage = () => {
  const [activeUtility, setActiveUtility] = useState(null);

  // All available utilities
  const utilities = [
    { id: "orderReport", name: "📄 Order / Payment Report", component: <OrderReportPage /> },
    { id: "otpReport", name: "🔐 OTP Report", component: <OtpReportPage /> }, // ✅ added here
    // { id: "another", name: "⚡ Another Utility", component: <AnotherUtility /> },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🛠️ Utilities Dashboard</h1>

      {/* Sidebar / Buttons */}
      <div className="flex gap-4 flex-wrap justify-center mb-8">
        {utilities.map((u) => (
          <button
            key={u.id}
            onClick={() => setActiveUtility(u.id)}
            className={`px-4 py-2 rounded-lg shadow-md transition ${
              activeUtility === u.id ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {u.name}
          </button>
        ))}
      </div>

      {/* Render Selected Utility */}
      <div className="border rounded-xl p-6 bg-white shadow-lg">
        {activeUtility ? (
          utilities.find((u) => u.id === activeUtility)?.component
        ) : (
          <p className="text-center text-gray-500">⚡ Select a utility to get started!</p>
        )}
      </div>
    </div>
  );
};

export default UtilitiesPage;
