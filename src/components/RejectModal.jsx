

import toast from "react-hot-toast";
import React from "react";

const CancelBookingModal = ({
  isOpen,
  onClose,
  onConfirm, // Use onConfirm to pass data to parent
  bookingId,
  rejectionRemarks,
  setRejectionRemarks,
  token,
  bookingDetails,
  userRole,
}) => {
  if (!isOpen) return null;

  const baseAmount = bookingDetails?.data?.baseAmount ?? 0;
  const taxAmount = bookingDetails?.data?.taxAmount ?? 0;

  // 🔹 Always deduct 10% cancellation charge
  const cancellationPercentage = 0.10;
  const cancellationDeduction = parseFloat((baseAmount * cancellationPercentage).toFixed(2));
  const defaultRefundAmount = parseFloat((baseAmount - cancellationDeduction).toFixed(2));

  const [editableRefundAmount, setEditableRefundAmount] = React.useState(defaultRefundAmount);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isAdmin = userRole === "0";

  const handleRefundAmountChange = (e) => {
    if (!isAdmin) {
      return;
    }
    const value = parseFloat(e.target.value) || 0;
    const cappedValue = Math.min(value, baseAmount);
    setEditableRefundAmount(cappedValue);
  };

  const handleConfirmCancel = async () => {
    if (!rejectionRemarks.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm({
        refundAmount: editableRefundAmount,
amount_to_be_refunded_after_round_off: Math.ceil(editableRefundAmount),
        cancellationCharge: cancellationDeduction,
        cancellationReason: rejectionRemarks,
      });
    } catch (error) {
      toast.error("Failed to process cancellation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRefund = editableRefundAmount; // refund only from base, tax is excluded

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4 sm:my-8 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 sm:px-6 py-4 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Cancel Booking</h2>
                  <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-2">
                    {/* <span className="truncate">ID: {bookingId}</span> */}
                    {isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">Admin</span>}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-200px)] sm:max-h-none overflow-y-auto">
            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-amber-800">Cancellation Policy</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    10% of the base amount will be deducted as cancellation charges. Tax amount is non-refundable.
                    {!isAdmin && <span className="block mt-1 text-xs">Contact admin to modify refund amount.</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Calculation */}
            {bookingDetails?.data && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 sm:px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Refund Calculation</h3>
                </div>
                <div className="p-3 sm:p-4 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Original Booking Amount</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700">Base Amount</span>
                        <span className="font-medium text-blue-900">₹{Number(baseAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700">Tax Amount</span>
                        <span className="font-medium text-blue-900">₹{Number(taxAmount).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-1.5">
                        {/* <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-blue-800">Total Paid</span>
                          <span className="font-semibold text-blue-900">₹{(baseAmount + taxAmount).toFixed(2)}</span>
                        </div> */}


                        <div className="flex justify-between items-center text-sm">
  <span className="font-medium text-blue-800">Total Paid</span>
  <span className="font-semibold text-blue-900">
    ₹{Math.ceil(baseAmount + taxAmount)}
    <span className="text-xs font-normal text-blue-700 ml-2">
      (₹{(baseAmount + taxAmount).toFixed(2)})
    </span>
  </span>
</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-800">Cancellation Breakdown</h4>
                    {/* <div className="flex justify-between items-center text-sm gap-2">
                      <span className="text-gray-600">Base Amount Refund</span>
                      <span className="font-medium text-gray-900">₹{Number(defaultRefundAmount).toFixed(2)}</span>
                    </div> */}


<div className="flex justify-between items-center text-sm gap-2">
  <span className="text-gray-600">Base Amount Refund</span>
  {isAdmin ? (
    <input
      type="number"
      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={editableRefundAmount}
      onChange={handleRefundAmountChange}
      min="0"
      max={baseAmount}
      disabled={isSubmitting}
      title="Admin can edit refund amount"
    />
  ) : (
    <span className="font-medium text-gray-900">₹{Number(defaultRefundAmount).toFixed(2)}</span>
  )}
</div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-600">Cancellation Charges (10%)</span>
                      <span className="font-medium text-red-700">-₹{Number(cancellationDeduction).toFixed(2)}</span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-yellow-700">Tax Amount Paid (Non-refundable)</span>
                        <span className="font-medium text-yellow-800">₹{Number(taxAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-green-800">Total Refund Amount</span>
                      <span className="text-lg sm:text-xl font-bold text-green-700">₹{Number(totalRefund).toFixed(2)}</span>
                    </div> */}


                    <div className="flex justify-between items-center">
  <span className="text-sm font-semibold text-green-800">
    Total Refund Amount
  </span>
  <span className="text-lg sm:text-xl font-bold text-green-700">
    ₹{Math.ceil(Number(totalRefund))}
    <span className="text-sm font-normal text-green-700 ml-2">
      ( ₹{Number(totalRefund).toFixed(2)})
    </span>
  </span>
</div>
                    <p className="text-xs text-green-600 mt-1">
                      You will receive     ₹{Math.ceil(Number(totalRefund))} back to your original payment method
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                placeholder="Please provide a detailed reason for cancellation..."
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500">
                This information will be included in the cancellation record and refund documentation.
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
            <button
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 order-2 sm:order-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2"
              onClick={handleConfirmCancel}
              disabled={isSubmitting || !rejectionRemarks.trim()}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
