// StudentFeeManagementView.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, FileText } from 'lucide-react';
import {
  generateMonthlyCollectionPdf,
  generateClassWiseRevenuePdf,
  generatePendingVsCollectedPdf,
  addStudentPayment,
  generateReceiptPdf,
  sendDueFeeNotifications
} from '../../../api/studentFeeApi';
import useSchoolClasses from '../../../hooks/useSchoolClasses';
import FilterSection from './FilterSection';
import StudentFeesTable from './StudentFeesTable';
import PaymentModal from './PaymentModal';
import NotificationModal from './NotificationModal';
import ReceiptViewerModal from './ReceiptViewerModal';
import { downloadBlob } from '../../../utils/download';

const StudentFeeManagementView = ({
  studentFees,
  loading,
  filter,
  handleFilterChange,
  clearFilters,
  academicYears,
  loadingAcademicYears,
  students,
  loadingStudents,
  schoolId,
  fetchStudentFees
}) => {
  const { classes, loading: classesLoading } = useSchoolClasses();
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState({
    classId: '',
    academicYear: academicYears.length > 0 ? academicYears[0].value : '',
  });

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleAddPaymentClick = (studentFee) => {
    setSelectedStudentFee(studentFee);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (studentFeeId, paymentData) => {
    setIsPaymentSubmitting(true);
    try {
      const response = await addStudentPayment(studentFeeId, paymentData);
      toast.success('Payment added successfully!');
      setPaymentModalOpen(false);
      fetchStudentFees();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to add payment');
      console.error('Payment submission error:', error);
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (studentFeeId, receiptNumber) => {
    try {
      const blob = await generateReceiptPdf(studentFeeId, receiptNumber);
      const ok = downloadBlob(blob, `receipt-${receiptNumber}.pdf`, 'application/pdf');
      if (!ok) throw new Error('Failed to trigger download');
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to download receipt');
      console.error('Download receipt error:', error);
    }
  };

  const handleViewReceipt = (fee, payment) => {
    const studentName = fee?.studentId?.name || `${fee?.studentId?.firstName || ''} ${fee?.studentId?.lastName || ''}`.trim();
    const className = fee?.classId?.className || getClassName?.(fee?.classId?._id) || 'N/A';
    const academicYear = fee?.academicYear || fee?.feeStructureId?.academicYear || '';
    const section = fee?.classId?.section || fee?.studentId?.sectionName || fee?.studentId?.section || fee?.studentId?.sectionId?.name || '';

    setSelectedReceipt({
      receiptNumber: payment?.receiptNumber,
      date: payment?.date,
      studentName,
      className,
      section,
      academicYear,
      amount: Number(payment?.amount || 0),
      mode: payment?.paymentMode || payment?.mode || '',
      remark: payment?.remark || ''
    });
    setReceiptModalOpen(true);
  };

  const handleSendNotifications = async (notificationData) => {
    setIsNotificationSubmitting(true);
    try {
      const response = await sendDueFeeNotifications(schoolId, notificationData);
      toast.success(response.message);
      setNotificationModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to send notifications');
      console.error('Send notification error:', error);
    } finally {
      setIsNotificationSubmitting(false);
    }
  };

  const handleDownloadMonthlyReport = async () => {
    try {
      const blob = await generateMonthlyCollectionPdf(schoolId, { academicYear: filter.academicYear || academicYears[0]?.value });
      const ok = downloadBlob(blob, `monthly-collection-report-${Date.now()}.pdf`, 'application/pdf');
      if (!ok) throw new Error('Failed to trigger download');
      toast.success('Monthly report downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to download monthly report');
      console.error('Download monthly report error:', error);
    }
  };

  const handleDownloadClassWiseRevenueReport = async () => {
    try {
      const blob = await generateClassWiseRevenuePdf(schoolId, { academicYear: filter.academicYear || academicYears[0]?.value });
      const ok = downloadBlob(blob, `class-wise-revenue-report-${Date.now()}.pdf`, 'application/pdf');
      if (!ok) throw new Error('Failed to trigger download');
      toast.success('Class-wise revenue report downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to download class-wise revenue report');
      console.error('Download class-wise revenue report error:', error);
    }
  };

  const handleDownloadPendingVsCollectedReport = async () => {
    try {
      const blob = await generatePendingVsCollectedPdf(schoolId, { academicYear: filter.academicYear || academicYears[0]?.value });
      const ok = downloadBlob(blob, `pending-vs-collected-report-${Date.now()}.pdf`, 'application/pdf');
      if (!ok) throw new Error('Failed to trigger download');
      toast.success('Pending vs Collected report downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to download pending vs collected report');
      console.error('Download pending vs collected report error:', error);
    }
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c._id === classId);
    return cls ? cls.className : 'N/A';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Fee Management</h1>

      <FilterSection
        filter={filter}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        classes={classes}
        classesLoading={classesLoading}
        academicYears={academicYears}
        loadingAcademicYears={loadingAcademicYears}
        students={students}
        loadingStudents={loadingStudents}
        setNotificationModalOpen={setNotificationModalOpen}
        handleDownloadMonthlyReport={handleDownloadMonthlyReport}
        handleDownloadClassWiseRevenueReport={handleDownloadClassWiseRevenueReport}
        handleDownloadPendingVsCollectedReport={handleDownloadPendingVsCollectedReport}
      />

      <StudentFeesTable
        studentFees={studentFees}
        loading={loading}
        classes={classes}
        getClassName={getClassName}
        handleAddPaymentClick={handleAddPaymentClick}
        handleDownloadReceipt={handleDownloadReceipt}
        handleViewReceipt={handleViewReceipt}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        studentFee={selectedStudentFee}
        isSubmitting={isPaymentSubmitting}
      />

      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        onSubmit={handleSendNotifications}
        isSubmitting={isNotificationSubmitting}
        classes={classes}
        academicYears={academicYears}
        filter={notificationFilter}
        setFilter={setNotificationFilter}
      />

      <ReceiptViewerModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receiptData={selectedReceipt}
      />
    </div>
  );
};

export default StudentFeeManagementView;