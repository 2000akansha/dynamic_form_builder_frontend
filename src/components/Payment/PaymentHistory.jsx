import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { IconButton, Modal, Box, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../Layout/Student/Header";
import { BASE_URL } from "../../config";
import Navmaster from "../../Layout/Student/Navmaster";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PaymentModal from "../../Components/Payment/PaymentModal";
import Cookies from "js-cookie";
import { handleApiError } from "../Common/errorHandler";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";

function PaymentHistory() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("No token found");
    }
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/billing`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.statusCode === 200) {
          setHostels(response.data.data);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [applicant]);

  const handlePayFees = (row) => {
    setSelectedRow(row);
    setOpenPaymentModal(true);
  };
  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      name: "Bill No.",
      selector: (row) => row.billNumber,
      sortable: true,
    },
    {
      name: "Bill Date",
      selector: (row) => row.billDate,
      sortable: true,
    },
    {
      name: "Bill Period",
      selector: (row) => row.periodFrom,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },

    {
      name: "Overdue Days",
      selector: (row) => row.overviewDays || "--",
      sortable: true,
    },
    {
      name: "Penalty Amount",
      selector: (row) => row.quota || "--",
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => row.totalAmount || "--",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => {
        switch (row.paymentStatus) {
          case "1":
            return "Paid";
          case "2":
            return "Overdue";
          default:
            return "Pending";
        }
      },
      cell: (row) => {
        const statusText =
          row.paymentStatus === "1"
            ? "Paid"
            : row.paymentStatus === "2"
            ? "Overdue"
            : "Pending";
        const color =
          row.paymentStatus === "1"
            ? "text-green-600"
            : row.paymentStatus === "2"
            ? "text-red-600"
            : "text-yellow-600";
        return <span className={`font-semibold ${color}`}>{statusText}</span>;
      },
      sortable: true,
    },

    {
      name: "Transaction No.",
      selector: (row) => row.transactionNumber || "--",
      sortable: true,
    },
    {
      name: "Download Invoice",
      selector: (row) => row.downloadInvoice || "--",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Tooltip
          title={
            row.paymentStatus !== "0" || row.paymentStatus !== "2"
              ? "Pay Fees"
              : "Payment available only for approved applications"
          }
        >
          <span>
            <IconButton
              onClick={() => handlePayFees(row)}
              className="text-indigo-600 hover:text-indigo-800"
              disabled={row.paymentStatus === "1"}
            >
              <CurrencyRupeeIcon />
            </IconButton>
          </span>
        </Tooltip>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: 800,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    maxHeight: "80vh",
    overflowY: "auto",
  };
  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: "10px",
        overflow: "hidden",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#FBD04F4A",
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-sans">
      <Navmaster />
      <div className="main-container flex flex-col md:ml-[265px] overflow-x-hidden">
        <Header />
        <div className="p-6" style={{ height: "90vh" }}>
          <div className="backdrop-blur-lg bg-white/70 border border-gray-200 w-full p-8 rounded-3xl shadow-2xl mt-4 transition-all duration-300">
            <div className="flex items-center">
              <IconButton
                aria-label="go back"
                style={{ color: "#4f46e5" }}
                onClick={() => navigate(-1)}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <h2 className="text-2xl font-bold text-[#2E3A59] mb-1">
                Payment History
              </h2>
            </div>
            <hr className="mb-6 border-gray-300" />
            <DataTable
              columns={columns}
              data={hostels}
              pagination
              striped
              highlightOnHover
              pointerOnHover
              responsive
              customStyles={customStyles}
            />

            {selectedRow && (
              <PaymentModal
                isOpen={openPaymentModal}
                onClose={handleClosePaymentModal}
                billId={selectedRow._id}
                amount={selectedRow.totalAmount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistory;
