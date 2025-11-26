import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Printer, Calendar, MapPin, User, CreditCard, FileText, Building } from 'lucide-react';
import Cookies from "js-cookie";

const PaymentInvoicePage = () => {
  const { bookingId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock invoice data - replace with actual API call
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - replace with actual fetch
        const mockInvoice = {
          orderId: `ORD-${bookingId}`,
          transactionNumber: `TXN-${Date.now()}`,
          paymentMethod: 'Credit Card',
          paymentDateTime: new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          customerName: 'John Doe',
          customerMobile: '+91 98765 43210',
          propertyName: 'Garden View Apartment',
          propertyAddress: 'Sector 5, Bemina, Srinagar, Jammu & Kashmir 190018',
          bookedFrom: '25/08/2024',
          bookedTo: '30/08/2024',
          perDayPrice: 2500,
          taxPercentage: 12,
          amountFigures: 12500,
          totalAmount: 14000,
          amountWords: 'Fourteen Thousand Rupees Only'
        };

        setInvoice(mockInvoice);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchInvoice();
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    const invoiceContent = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Invoice - ${invoice?.orderId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .invoice {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .field {
              margin: 8px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
            }
            .amount-words {
              font-weight: bold;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>${invoiceContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600">The requested payment invoice could not be found.</p>
        </div>
      </div>
    );
  }

  const taxAmount = (invoice.amountFigures * invoice.taxPercentage / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons - Hidden in print */}
        <div className="flex justify-end gap-4 mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Invoice</h1>
            <h2 className="text-xl font-semibold text-blue-600">Srinagar Development Authority</h2>
          </div>

          {/* Transaction Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Order ID:</span>
                <span className="font-mono">{invoice.orderId}</span>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <div><span className="font-semibold">Transaction Number:</span> {invoice.transactionNumber}</div>
                  <div><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Payment Date & Time:</span>
                <span>{invoice.paymentDateTime}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              <User className="w-5 h-5" />
              Customer Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><span className="font-semibold">Name:</span> {invoice.customerName}</p>
                <p><span className="font-semibold">Mobile:</span> {invoice.customerMobile}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              <Building className="w-5 h-5" />
              Property Details
            </h3>
            <div className="space-y-3">
              <p><span className="font-semibold">Property Name:</span> {invoice.propertyName}</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <span className="font-semibold">Address:</span> {invoice.propertyAddress}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <p><span className="font-semibold">Booked Dates:</span> {invoice.bookedFrom} to {invoice.bookedTo}</p>
                <p><span className="font-semibold">Per Day Price:</span> ₹{invoice.perDayPrice.toLocaleString('en-IN')}</p>
              </div>
              <p><span className="font-semibold">Tax Percentage:</span> {invoice.taxPercentage}%</p>
            </div>
          </div>

          {/* Amount Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Amount</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 px-4 py-3 text-left font-bold">Description</th>
                    <th className="border border-gray-800 px-4 py-3 text-left font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-800 px-4 py-3">Base Amount</td>
                    <td className="border border-gray-800 px-4 py-3">₹{invoice.amountFigures.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 px-4 py-3">Tax ({invoice.taxPercentage}%)</td>
                    <td className="border border-gray-800 px-4 py-3">₹{parseFloat(taxAmount).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-800 px-4 py-3 font-bold">Total</td>
                    <td className="border border-gray-800 px-4 py-3 font-bold">₹{invoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-lg">
              <span className="font-bold">Amount in Words:</span> {invoice.amountWords}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
            <p>Thank you for your payment!</p>
            <p>This is a computer generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInvoicePage;