import React, { useState } from "react";
import apiClient from "../../utils/axois";




const OrderReportPage = () => {
  const [searchType, setSearchType] = useState("orderId"); // "orderId" or "paymentId"
  const [searchText, setSearchText] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    const ids = searchText.split(/[\s,]+/).filter(Boolean);

    if (!ids.length) {
      alert("⚠️ Please enter at least one ID.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiClient.post("order/report", { ids, searchType });

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

  const formatCurrency = (amt) => `₹${amt?.toLocaleString() || 0}`;

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
      <h1 className="text-3xl font-bold mb-6 text-center">📄 Order / Payment Resume Generator</h1>

      {/* Search Type Toggle */}
      <div className="mb-4 flex gap-4 justify-center">
        <button
          className={`px-4 py-2 rounded ${searchType === "orderId" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setSearchType("orderId")}
        >
          Search by Order ID
        </button>
        <button
          className={`px-4 py-2 rounded ${searchType === "paymentId" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          onClick={() => setSearchType("paymentId")}
        >
          Search by Payment ID
        </button>
      </div>

      {/* Input */}
      <textarea
        rows={4}
        placeholder={`Enter ${searchType === "orderId" ? "Order IDs" : "Payment IDs"} (comma or line separated)`}
        className="w-full border p-3 rounded mb-4 resize-none"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
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
            <div key={idx} className="border p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-200 bg-white">

              {/* Header */}
              <h2 className="text-2xl font-bold mb-3">
                {searchType === "orderId" ? "🆔 Order ID" : "💳 Payment ID"}:{" "}
                {searchType === "orderId" ? r.orderId : r.paymentId}
              </h2>

              {/* Order Info */}
              {searchType === "orderId" && (
                <>
                  <p>📌 Status: <b>{r.status}</b></p>
                  <p>🔁 Attempts: <b>{r.attempts}</b></p>
                  <p>💰 Amount: <b>{formatCurrency(r.amount)}</b> ({r.currency})</p>

                  {r.reqBody && (
                    <div className="my-3 p-4 bg-gray-50 rounded">
                      <h3 className="font-semibold mb-2 text-gray-700">🏠 Booking Details</h3>
                      <p>Booking ID: <b>{r.reqBody.bookingId}</b></p>
                      <p>Property ID: <b>{r.reqBody.propertyId}</b></p>
                      <p>Property Code: <b>{r.reqBody.propertyPrintableId}</b></p>
                      <p>Purpose: <b>{r.reqBody.bookingPurpose}</b></p>
                      <p>Duration: <b>{r.reqBody.bookedFromDate} ➝ {r.reqBody.bookedUptoDate}</b> ({r.reqBody.bookedForDaysCount} days)</p>
                      <p>Base Amount: <b>{formatCurrency(r.reqBody.baseAmount)}</b></p>
                      <p>Tax: <b>{formatCurrency(r.reqBody.taxAmount)}</b> ({r.reqBody.taxPercentage}%)</p>
                    </div>
                  )}

                  {r.payments?.length > 0 && (
                    <div className="my-3 p-4 bg-blue-50 rounded">
                      <h3 className="font-semibold text-blue-700 mb-2">💳 Payments Made</h3>
                      {r.payments.map((p, i) => (
                        <div key={i} className="ml-3 mb-2">
                          <p>Payment ID: <b>{p.paymentId}</b></p>
                          <p>Amount: <b>{formatCurrency(p.amount)}</b>, Status: <b>{p.status}</b></p>
                          <p>Mode: <b>{p.paymentMode}</b>, Refunded: <b>{p.isRefunded ? "Yes" : "No"}</b></p>
                          <p>Paid On: <b>{formatDate(p.paymentDateTime)}</b></p>
                        </div>
                      ))}
                    </div>
                  )}

                  {r.bookingPayments?.length > 0 && (
                    <div className="my-3 p-4 bg-green-50 rounded">
                      <h3 className="font-semibold text-green-700 mb-2">📒 Booking Reconciliation</h3>
                      {r.bookingPayments.map((b, i) => (
                        <div key={i} className="ml-3 mb-2">
                          <p>Txn ID: <b>{b.paymentGatewayTxnId || "—"}</b></p>
                          <p>Payment Amount: <b>{formatCurrency(b.paymentAmount)}</b>, Status: <b>{b.paymentStatus}</b></p>
                          <p>Reference No: <b>{b.transactionReference || "—"}</b></p>
                          <p>Remarks: <b>{b.paymentRemarks || "—"}</b></p>
                          {/* <p>Paid On: <b>{formatDate(b.paymentDateTime)}</b></p> */}


                          <p>
  Paid On: <b>{formatDate(b.paymentDateTime !== "—" && b.paymentDateTime ? b.paymentDateTime : (b.createdAt || b.updatedAt || "—"))}</b>
</p>

                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Payment Info */}
              {searchType === "paymentId" && (
                <>
                  <p>📌 Status: <b>{r.status}</b></p>
                  <p>💰 Amount: <b>{formatCurrency(r.amount)}</b> ({r.currency})</p>
                  <p>Mode: <b>{r.paymentMode}</b></p>
                  <p>Refunded: <b>{r.isRefunded ? "Yes" : "No"}</b></p>
                  <p>Paid On: <b>{formatDate(r.paymentDateTime)}</b></p>

                  {/* Linked Order Details */}
                  {r.reqBody && (
                    <div className="my-3 p-4 bg-gray-50 rounded">
                      <h3 className="font-semibold mb-2 text-gray-700">🆔 Linked Order & Booking Details</h3>
                      <p>Order ID: <b>{r.orderId}</b></p>
                      <p>Status: <b>{r.status}</b></p>
                      <p>Booking ID: <b>{r.reqBody.bookingId}</b></p>
                      <p>Property Code: <b>{r.reqBody.propertyPrintableId}</b></p>
                      <p>Purpose: <b>{r.reqBody.bookingPurpose}</b></p>
                      <p>Duration: <b>{r.reqBody.bookedFromDate} ➝ {r.reqBody.bookedUptoDate}</b> ({r.reqBody.bookedForDaysCount} days)</p>
                      <p>Base Amount: <b>{formatCurrency(r.reqBody.baseAmount)}</b></p>
                      <p>Tax: <b>{formatCurrency(r.reqBody.taxAmount)}</b> ({r.reqBody.taxPercentage}%)</p>
                    </div>
                  )}

                  {/* Booking Payments */}
                  {r.bookingPayments?.length > 0 && (
                    <div className="my-3 p-4 bg-green-50 rounded">
                      <h3 className="font-semibold text-green-700 mb-2">📒 Booking Payment Reconciliation</h3>
                      {r.bookingPayments.map((b, i) => (
                        <div key={i} className="ml-3 mb-2">
                          <p>Txn ID: <b>{b.paymentGatewayTxnId || "—"}</b></p>
                          <p>Payment Amount: <b>{formatCurrency(b.paymentAmount)}</b>, Status: <b>{b.paymentStatus}</b></p>
                          <p>Reference No: <b>{b.transactionReference || "—"}</b></p>
                          <p>Remarks: <b>{b.paymentRemarks || "—"}</b></p>
                          {/* <p>Paid On: <b>{formatDate(b.paymentDateTime)}</b></p> */}

<p>
  Paid On: <b>{formatDate(b.paymentDateTime !== "—" && b.paymentDateTime ? b.paymentDateTime : (b.createdAt || b.updatedAt || "—"))}</b>
</p>

                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};




export default OrderReportPage;
