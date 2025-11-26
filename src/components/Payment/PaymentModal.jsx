import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from "js-cookie";
import { Loader } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';
const BASE_API_URL = import.meta.env.VITE_PAYMENT_BASE_URL;





const PaymentModal = ({
  isOpen,
  onClose,
  propertyId,
  amount,
  bookedFromDate,
  bookedUptoDate,
  bookedForDaysCount,
  bookingAmount,
  taxAmount,
  taxPercentage,
  baseAmount,
  bookingPurpose,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const [bookingId, setBookingId] = useState(null);  // <-- new state for bookingId
  const createOrder = async () => {
    const token = Cookies.get("accessToken");  // ✅ correct

    if (!token) {
      toast.error("No token found. Please log in.", { position: "top-right" });
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Send all booking details in the request body
      const res = await axios.post(
        // 'http://localhost:1059/api/v1/payment/create-order',
        `${BASE_URL}/api/v1/payment/create-order`,

        {
          amount,
          currency: "INR",
          propertyId,
          bookedFromDate,
          bookedUptoDate,
          bookedForDaysCount,
          bookingAmount,
          taxAmount,
          taxPercentage,
          baseAmount,
          bookingPurpose,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (res.data.success) {
         setBookingId(res.data.bookingId);  // store bookingId here
        return {
          orderId: res.data.orderId,
          amount: res.data.amount,
          currency: res.data.currency,
           bookingId: res.data.bookingId,  // also return for convenience
        };
      } else {
        toast.error(res.data.message || "Failed to create order");
        return null;
      }
    } catch (error) {
      toast.error("Failed to create order. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleHostedCheckout = async () => {
    const order = await createOrder();
    if (!order) {
      return;
    }
    const { orderId, amount, currency } = order;

    // Dynamically create form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://api.razorpay.com/v1/checkout/embedded";

    const fields = {
      key_id: "rzp_test_gNF9sePXnK9N6z",
      amount: amount.toString(),
      currency,
      order_id: orderId,
      name: "Customer Portal",
      description: "Property Booking Payment",
      image: "https://yourdomain.com/logo.png",
      "prefill[name]": "John Doe",
      "prefill[contact]": "9999999999",
      "prefill[email]": "john.doe@example.com",
   // Pass bookingId here in notes so backend gets it on verify payment
      "notes[bookingId]": bookingId,
      // Pass booking details as notes - Razorpay supports custom notes
      "notes[propertyId]": propertyId,
      "notes[bookedFromDate]": bookedFromDate,
      "notes[bookedUptoDate]": bookedUptoDate,
      "notes[bookedForDaysCount]": bookedForDaysCount,
      "notes[bookingAmount]": bookingAmount,
      "notes[taxAmount]": taxAmount,
      "notes[taxPercentage]": taxPercentage,
      "notes[baseAmount]": baseAmount,
      "notes[bookingPurpose]": bookingPurpose,

      // callback_url: "http://localhost:1059/api/v1/payment/verify-payment",
      callback_url: `${BASE_URL}/api/v1/payment/verify-payment`,
      cancel_url: `${import.meta.env.VITE_FRONTEND_URL}/failed`,
    };

    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="payment-modal-title"
      aria-describedby="payment-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <Typography id="payment-modal-title" variant="h6" component="h2" mb={2}>
          Razorpay Hosted Checkout
        </Typography>
        {loading && (
          <Typography align="center" mb={2}>
            Loading...
          </Typography>
        )}
        <Button
          onClick={handleHostedCheckout}
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            mb: 1,
            bgcolor: "#3399CC",
            "&:hover": { bgcolor: "#287AA3" },
          }}
        >
          Pay ₹{amount}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            bgcolor: "#ccc",
            color: "#000",
            "&:hover": { bgcolor: "#B0B0B0", borderColor: "#B0B0B0" },
          }}
        >
          Close
        </Button>
        {loading && <Loader />}
      </Box>
    </Modal>
  );
};

export default PaymentModal;