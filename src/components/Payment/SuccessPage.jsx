
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import convertToINRWords from "../../utils/convertToINRWords";
import convertToINR from "../../utils/convertToINR";















const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentDetails, setPaymentDetails] = useState({
    paymentId: "",
    orderId: "",
    amount: "",
    transactionId: "",
    status: "success",
  });

  const [formattedAmount, setFormattedAmount] = useState("");
  const [amountInWords, setAmountInWords] = useState("");

  // State to handle refresh countdown
  const [refreshCountdown, setRefreshCountdown] = useState(null);

  useEffect(() => {
    // Detect refresh using modern Navigation Timing API
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;

    if (navigationType === "reload") {
      // Start countdown from 5
      setRefreshCountdown(5);

      const interval = setInterval(() => {
        setRefreshCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            navigate("/home/my-bookings", { replace: true });
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return; // Don't process paymentDetails on refresh
    }

    // Normal load with state or query params
    const stateData = location.state;
    const query = new URLSearchParams(location.search);

    if (stateData) {
      setPaymentDetails({
        paymentId: stateData.paymentId,
        orderId: stateData.orderId,
        amount: stateData.amount,
        transactionId: stateData.transactionId,
        status: stateData.status || "success",
      });
    } else {
      setPaymentDetails({
        paymentId: query.get("paymentId") || "",
        orderId: query.get("orderId") || "",
        amount: query.get("amount") || "",
        transactionId: query.get("transactionId") || "",
        status: query.get("status") || "success",
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (paymentDetails.amount) {
      const amountNum = Number(paymentDetails.amount);
      setFormattedAmount(convertToINR(amountNum));
      setAmountInWords(convertToINRWords(amountNum));
    }
  }, [paymentDetails.amount]);

  const handleGoHome = () => {
    navigate("/home/my-bookings");
  };

  return (
    <div className="h-screen flex flex-col bg-white relative">
      {/* Header */}
      <div className="h-30 w-full rounded-b-3xl overflow-hidden bg-gradient-to-b from-[#3B1C8C] to-[#5638b9] text-white flex justify-center pb-[44px]">
        <div className="w-full text-white px-6 py-4 relative">
          <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-xl font-semibold">Payment Status</h1>
            <div className="relative"></div>
          </div>
        </div>
      </div>

      {/* Background divider */}
      <div className="bg-[#f5f2ff] px-1 py-1 rounded-t-3xl -mt-12"></div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f2ff] px-6 pb-20">
        <div className="flex flex-col items-center justify-center mt-10">
          {/* Refresh Countdown Message */}
          {refreshCountdown !== null && (
            <p className="text-red-600 text-sm text-center mb-4 font-semibold">
              Oops 😅 You refreshed!
              Redirecting to properties listing in {refreshCountdown}...
            </p>
          )}

          {/* Refresh Warning (only show if NOT refreshing) */}
          {refreshCountdown === null && (
            <p className="text-sm text-gray-500 mb-4 text-center">
              ⚠️ Refreshing this page will redirect you to{" "}
              <strong>properties listing</strong>
            </p>
          )}

          {/* Video */}
          <div className="mb-6">
            <video
              src="/success.mp4"
              autoPlay
              muted
              playsInline
              onEnded={(e) => e.target.pause()}
              className="w-[250px] h-[250px] object-cover rounded-full shadow-lg"
            />
          </div>

          {/* Payment Info */}
          {refreshCountdown === null && (
            <>
              <h2 className="text-green-600 text-2xl font-bold mb-4">
                Payment Successful!
              </h2>
              <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Order ID:</span>
                  <span>{paymentDetails.orderId}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Payment ID:</span>
                  <span>{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Transaction ID:</span>
                  <span>{paymentDetails.transactionId}</span>
                </div>
                <div className="flex flex-col py-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Amount Paid:</span>
                    <span>{formattedAmount}</span>
                  </div>
                  {amountInWords && (
                    <span className="text-sm text-gray-500 mt-1 italic">
                      {amountInWords}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Button */}
        {refreshCountdown === null && (
          <div className="w-full px-6 absolute left-0 right-0 bottom-4">
            <button
              className="w-full bg-indigo-800 text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleGoHome}
            >
              Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
