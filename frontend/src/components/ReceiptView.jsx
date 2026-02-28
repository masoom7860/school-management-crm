import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReceiptView = ({ feeRecordId, paymentId }) => {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const logoRaw = localStorage.getItem("schoolLogo");
  const logo = logoRaw ? (logoRaw.startsWith("http") ? logoRaw : `${baseURL}/${logoRaw}`) : null;

  useEffect(() => {
    if (feeRecordId && paymentId) {
      // Assuming a backend API to fetch specific payment/receipt data
      // The existing generateReceipt API returns a PDF, not data.
      // We might need a new backend endpoint to fetch payment/receipt details by ID.
      // For now, let's assume we can fetch the fee record and find the payment within it.
      fetchReceiptData(feeRecordId, paymentId);
    } else {
      setLoading(false);
      setError('Fee Record ID or Payment ID is missing.');
    }
  }, [feeRecordId, paymentId]);

  const fetchReceiptData = async (feeId, paymentId) => {
    try {
      setLoading(true);
      // Assuming an API to get a single fee record by ID and it populates payments
      const res = await axios.get(`/api/student-fees/single/${feeId}`); // Assuming this endpoint exists
      const feeRecord = res.data.data; // Assuming data is in res.data.data

      if (feeRecord && feeRecord.payments) {
        const payment = feeRecord.payments.find(p => p._id === paymentId);
        if (payment) {
          // Combine fee record and payment data for display
          setReceiptData({ feeRecord, payment });
        } else {
          setError('Payment not found in fee record.');
        }
      } else {
        setError('Fee record not found or no payments available.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching receipt data:', err);
      setError('Failed to fetch receipt data.');
      setLoading(false);
      toast.error('Failed to fetch receipt data.');
    }
  };

  const handleDownloadReceipt = () => {
    if (receiptData) {
      // Use the existing generateReceipt API to download the PDF
      window.open(`/api/student-fees/receipt/${feeRecordId}/${paymentId}?type=payment`, '_blank');
    }
  };

  if (loading) return <div>Loading receipt details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!receiptData) return <div>No receipt data available.</div>;

  const { feeRecord, payment } = receiptData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Receipt Details</h1>

      {logo && (
        <img src={logo} alt="School Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border border-gray-200" onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }} />
      )}

      <div className="border border-gray-200 rounded-md p-6 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Payment Receipt</h2>

        <div className="mb-4">
          <p><strong>Receipt For:</strong> {feeRecord.student?.firstName} {feeRecord.student?.lastName} ({feeRecord.student?.rollNumber})</p>
          <p><strong>Academic Year:</strong> {feeRecord.academicYear}</p>
          <p><strong>Fee Structure:</strong> {feeRecord.feeStructure?.name || 'N/A'}</p>
        </div>

        <div className="mb-4">
          <p><strong>Payment Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
          <p><strong>Amount Paid:</strong> {payment.amount.toFixed(2)}</p>
          <p><strong>Payment Mode:</strong> {payment.mode}</p>
          <p><strong>Reference:</strong> {payment.reference || 'N/A'}</p>
          <p><strong>Note:</strong> {payment.note || 'N/A'}</p>
          {/* Assuming recordedBy is populated or available */}
          {/* <p><strong>Collected By:</strong> {payment.recordedBy?.name || 'N/A'}</p> */}
        </div>

        <div className="mb-4">
           <p><strong>Total Fee Amount:</strong> {feeRecord.totalAmount.toFixed(2)}</p>
           <p><strong>Total Amount Paid:</strong> {feeRecord.amountPaid.toFixed(2)}</p>
           <p><strong>Outstanding Balance:</strong> {feeRecord.balance.toFixed(2)}</p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleDownloadReceipt}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Download PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
