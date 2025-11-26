import React, { useState } from "react";

const BookingConfirmation = ({ isOpen, onClose, onConfirm, availableDates, totalAmount, taxRate }) => {
  if (!isOpen) return null;

  // calculate total with tax
  const taxAmount = (totalAmount * taxRate) / 100;
  const finalAmount = totalAmount + taxAmount;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[450px] p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Some dates are already booked!
        </h2>

        <p className="mb-2">Only the following dates are available and will be booked:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          {availableDates.map((date, idx) => (
            <li key={idx}>{date}</li>
          ))}
        </ul>

        <div className="space-y-2 mb-4">
          <p><strong>Total Available Days:</strong> {availableDates.length}</p>
          <p><strong>Base Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
          <p><strong>Tax ({taxRate}%):</strong> ₹{taxAmount.toLocaleString()}</p>
          <p className="text-lg font-bold text-green-600">
            Total Booking Amount (Incl. Taxes): ₹{finalAmount.toLocaleString()}
          </p>
        </div>

        {/* Input field to hold final amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Total Booking Amount (Incl. Taxes)
          </label>
          <input
            type="text"
            value={`₹${finalAmount.toLocaleString()}`}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(finalAmount)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
