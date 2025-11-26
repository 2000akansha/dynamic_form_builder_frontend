import React, { useState } from "react";
import apiClient from "../../utils/axois";

const OtpReportPage = () => {
  const [phone, setPhone] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.post("order/otp-report", { number: phone.trim() || null });

      if (data.status === "success") {
        setReportData(data.message || []);
      } else {
        alert(`❌ ${data.message || "No records found."}`);
        setReportData([]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    let d = date;
    if (typeof date === "object" && "$date" in date) d = date.$date;
    return new Date(d).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🔐 OTP Report Generator</h1>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter Phone Number (leave empty for all)"
        className="w-full border p-3 rounded mb-4"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={fetchReport}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mb-6"
      >
        {loading ? "Fetching..." : "Generate Report"}
      </button>

      {/* Display Report */}
      {reportData.length > 0 && (
        <div className="space-y-6">
          {reportData.map((r, idx) => (
            <div key={idx} className="border p-6 rounded-xl shadow-lg bg-white">
              <h2 className="text-xl font-bold mb-2">
                📱 {r.contactValue} ({r.contactType})
              </h2>
              <p>OTP: <b>{r.otp}</b></p>
              {/* <p>Purpose: <b>{r.purpose}</b></p> */}
              <p>Attempts: <b>{r.attempts}</b></p>
              <p>Expires At: <b>{formatDate(r.expiresAt)}</b></p>
              <p>Created At: <b>{formatDate(r.createdAt)}</b></p>

              {r.statusLogs?.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2 text-gray-700">📌 Status Logs</h3>
                  {r.statusLogs.map((s, i) => (
                    <p key={i}>
                      {s.status} ➝ {formatDate(s.updatedAt)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OtpReportPage;
