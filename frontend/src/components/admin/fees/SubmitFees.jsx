import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  addLedgerPayment,
  createStudentFeeLedger,
  deleteLedger,
  getFeeDependencies,
  getFeeMonths,
  getStudentFeeLedgers,
  downloadLedgerReceipt,
} from '../../../api/feesApi';
import {
  sendDueFeeNotifications,
  generateMonthlyCollectionPdf,
  generateClassWiseRevenuePdf,
  generatePendingVsCollectedPdf,
} from '../../../api/studentFeeApi';
import { getStudentsByQuery } from '../../../api/studentApi';
import { Loader2, DollarSign, Trash2, Bell, FileText, PieChart, Download, ChevronDown, X, Calendar, User, GraduationCap, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover, buttonHover, fadeIn, slideInUp } from '../../../utils/animations';
import PdfPreviewModal from './PdfPreviewModal';
import { downloadBlob } from '../../../utils/download';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const numberToWords = (input) => {
  let num = Number(input);
  if (Number.isNaN(num)) num = 0;
  if (num === 0) return 'Zero Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n, suffix) => {
    let str = '';
    if (n > 19) str += b[Math.floor(n / 10)] + (n % 10 ? ` ${a[n % 10]}` : '');
    else str += a[n];
    return str ? `${str}${suffix}` : '';
  };
  const numStr = `000000000${Math.round(num)}`.slice(-9);
  const match = numStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return '';
  let words = '';
  words += match[1] !== '00' ? inWords(parseInt(match[1], 10), ' Crore ') : '';
  words += match[2] !== '00' ? inWords(parseInt(match[2], 10), ' Lakh ') : '';
  words += match[3] !== '00' ? inWords(parseInt(match[3], 10), ' Thousand ') : '';
  words += match[4] !== '0' ? inWords(parseInt(match[4], 10), ' Hundred ') : '';
  words += match[5] !== '00' ? `${words !== '' ? 'and ' : ''}${inWords(parseInt(match[5], 10), '')}` : '';
  return `${words.trim()} Only`;
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN');
  } catch (err) {
    return '—';
  }
};

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
  Due: 'bg-red-100 text-red-700',
};

const formatStudentName = (student) => {
  if (!student) return 'Unnamed Student';
  if (typeof student === 'string') return student;
  if (student.name) return student.name;
  const parts = [student.firstName, student.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Unnamed Student';
};

const SubmitFees = ({ schoolId }) => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedSession, setSelectedSession] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [months, setMonths] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    student: null,
    studentName: '',
    months: [],
    selectedLedgerId: '',
    amount: '',
    mode: 'Cash',
    remark: '',
  });
  const [creatingLedger, setCreatingLedger] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState(null);
  const pdfContainerRef = useRef(null);

  const loadScript = useCallback((src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    }),
  );

  const ensureHtml2Pdf = useCallback(async () => {
    if (typeof window !== 'undefined' && window.html2pdf) return window.html2pdf;
    try {
      const mod = await import('html2pdf.js');
      const lib = mod?.default || mod;
      if (lib) {
        if (typeof window !== 'undefined') {
          window.html2pdf = lib;
        }
        return lib;
      }
    } catch (err) {
      console.warn('Dynamic html2pdf import failed, falling back to CDN', err);
    }
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js');
      return typeof window !== 'undefined' ? window.html2pdf : null;
    } catch (cdnErr) {
      console.error('Failed to load html2pdf from CDN', cdnErr);
      return null;
    }
  }, [loadScript]);

  useEffect(() => {
    if (!schoolId) return;
    const loadDependencies = async () => {
      try {
        const response = await getFeeDependencies(schoolId);
        const data = response?.data ?? {};
        setSessions(data.sessions ?? []);
        setClasses(data.classes ?? []);
        setSections(data.sections ?? []);
        if (data.sessions?.length) setSelectedSession(data.sessions[0]._id);
      } catch (error) {
        console.error('Failed to load dependencies', error);
        toast.error(error?.message || 'Failed to load dependencies');
      }
    };
    loadDependencies();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !selectedSession) return;
    const loadMonths = async () => {
      try {
        const response = await getFeeMonths(schoolId, { sessionId: selectedSession });
        const list = response?.data ?? [];
        setMonths(list);
        if (list.length > 0) setSelectedMonth(list[0]._id);
      } catch (error) {
        console.error('Failed to load months', error);
        toast.error(error?.message || 'Failed to load months');
      }
    };
    loadMonths();
  }, [schoolId, selectedSession]);

  const filteredClasses = useMemo(() => classes, [classes]);
  const filteredSections = useMemo(() => {
    if (!selectedClass) return [];
    return sections.filter((section) => section.classId === selectedClass || section.classId?._id === selectedClass);
  }, [sections, selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return classStudents;
  }, [classStudents, selectedClass]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setClassStudents([]);
        return;
      }
      try {
        setLoadingStudents(true);
        const response = await getStudentsByQuery({
          schoolId,
          classId: selectedClass,
          sectionId: selectedSection || undefined,
        });
        const list = response?.data ?? [];
        setClassStudents(list);
      } catch (error) {
        console.error('Failed to load students', error);
        toast.error(error?.message || 'Failed to load students');
        setClassStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [schoolId, selectedClass, selectedSection]);

  const fetchLedgers = useCallback(async () => {
    if (!selectedSession || !selectedClass) {
      toast.error('Select session and class');
      return;
    }
    try {
      setLoading(true);
      const response = await getStudentFeeLedgers(schoolId, {
        sessionId: selectedSession,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
        monthId: selectedMonth || undefined,
        studentId: selectedStudent || undefined,
      });
      
      console.log('Fetched ledgers data:', response?.data);
      const ledgerData = response?.data ?? [];
      console.log('Ledger data structure:', ledgerData.map(l => ({
        studentId: l.studentId,
        schoolId: l.schoolId,
        classId: l.classId,
        sectionId: l.sectionId,
        sessionId: l.sessionId,
        monthName: l.monthName,
        totalAmount: l.totalAmount
      })));
      
      setLedgers(ledgerData);
    } catch (error) {
      console.error('Failed to load ledgers', error);
      toast.error(error?.message || 'Failed to load ledgers');
    } finally {
      setLoading(false);
    }
  }, [selectedSession, selectedClass, selectedSection, selectedMonth, selectedStudent, schoolId]);

  useEffect(() => {
    if (selectedSession && selectedClass) {
      fetchLedgers();
    }
  }, [fetchLedgers]);

  const sessionLabel = useMemo(() => sessions.find((s) => s._id === selectedSession)?.yearRange || '', [sessions, selectedSession]);
  const monthLabel = useMemo(() => months.find((m) => m._id === selectedMonth)?.name || 'All Months', [months, selectedMonth]);

  const totals = useMemo(() => {
    const summaries = ledgers.reduce(
      (acc, ledger) => {
        acc.assigned += Number(ledger.totalAmount || 0);
        acc.paid += Number(ledger.paidAmount || 0);
        acc.due += Number(ledger.dueAmount || 0);
        return acc;
      },
      { assigned: 0, paid: 0, due: 0 },
    );
    return summaries;
  }, [ledgers]);

  const RECEIPT_PDF_STYLES = `
  <style>
    @page { 
      size: A4; 
      margin: 12mm; 
    }
    * { 
      box-sizing: border-box; 
    }
    body { 
      margin: 0; 
      font-family: 'Times New Roman', serif; 
      color: #0f172a; 
      background: #ffffff; 
      font-size: 16px;
      line-height: 1.4;
    }
    .pdf-root { 
      display: flex; 
      flex-direction: column; 
      gap: 12mm; 
      width: 190mm; 
      margin: 0 auto; 
      background: #ffffff;
    }
    .receipt-section { 
      page-break-inside: avoid; 
    }
    .receipt-pair { 
      display: grid; 
      grid-template-columns: repeat(2, minmax(0, 1fr)); 
      gap: 12mm; 
    }
    .receipt-card { 
      border: 1px solid #000; 
      padding: 10mm 9mm; 
      display: flex; 
      flex-direction: column; 
      gap: 6mm; 
      min-height: 255mm;
      background: #ffffff;
    }
    .receipt-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
    }
    .receipt-header h1 { 
      margin: 0; 
      font-size: 18px; 
      letter-spacing: 0.4px; 
      text-transform: uppercase; 
    }
    .copy-label { 
      font-size: 12px; 
      margin-top: 2mm; 
      font-weight: 600; 
      letter-spacing: 0.5px; 
    }
    .logo-holder { 
      width: 28mm; 
      height: 28mm; 
      border: 1px dashed #cbd5f5; 
    }
    .sub-header { 
      text-align: center; 
      display: flex; 
      flex-direction: column; 
      gap: 2mm; 
    }
    .sub-header p { 
      margin: 0; 
      font-size: 12px; 
    }
    .title { 
      font-weight: 600; 
      text-transform: uppercase; 
    }
    .received span { 
      font-weight: 600; 
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: repeat(2, minmax(0, 1fr)); 
      gap: 2mm 10mm; 
      font-size: 11px; 
    }
    .info-grid span { 
      font-weight: 600; 
    }
    .fee-table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 11px; 
    }
    .fee-table th, .fee-table td { 
      border: 1px solid #000; 
      padding: 4px 6px; 
    }
    .fee-table th { 
      text-align: center; 
      font-weight: 700; 
    }
    .fee-table td.text-right { 
      text-align: right; 
    }
    .fee-table td.text-center { 
      text-align: center; 
    }
    .fee-table .totals td,
    .fee-table .paid-row td,
    .fee-table .due-row td { 
      font-weight: 600; 
    }
    .receipt-footer { 
      display: flex; 
      flex-direction: column; 
      gap: 4mm; 
      font-size: 11px; 
    }
    .receipt-footer .issue-details { 
      display: flex; 
      justify-content: space-between; 
    }
    .receipt-footer .ack-box { 
      border: 1px solid #000; 
      padding: 4mm; 
      text-align: center; 
    }
    .receipt-footer .ack-box .heading { 
      font-weight: 700; 
      margin-bottom: 2mm; 
    }
    .receipt-footer .signatures { 
      display: flex; 
      justify-content: space-between; 
    }
    .page-break { 
      break-after: page; 
      height: 0; 
    }
    /* Ensure visibility for PDF generation */
    .receipt-card, .receipt-header, .sub-header, .info-grid, .fee-table, .receipt-footer {
      visibility: visible !important;
      display: block !important;
    }
  </style>
`;

  const buildReceiptCopy = (entry, month, copyLabel) => {
    // Debug log
    console.log('Building receipt copy for:', { entry, month, copyLabel });
    
    // Validate required data
    if (!entry || !month) {
      console.error('Missing entry or month data');
      return `
        <div class="receipt-card">
          <div class="sub-header">
            <p class="title">Error: Missing data for receipt generation</p>
          </div>
        </div>
      `;
    }

    const studentName = entry.displayName || formatStudentName(entry.studentId) || 'Unnamed Student';
    const schoolName = entry.schoolName || entry.studentId?.schoolName || entry.studentId?.school?.name || 'School Receipt';
    const classLabel = entry.className || entry.studentId?.classId?.className || entry.studentId?.className || '—';
    const sectionLabel = entry.section || entry.studentId?.sectionName || entry.studentId?.section || entry.studentId?.sectionId?.name || '—';
    const srNumber = entry.srNumber || entry.studentId?.admissionNumber || entry.studentId?.srNumber || '—';
    const academicYear = entry.sessionLabel || sessionLabel || '—';
    const monthName = month.monthName || month.name || '—';
    const dueDate = formatDate(month.dueDate);
    
    // Handle payments data
    const payments = Array.isArray(month.payments) ? month.payments : [];
    const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
    
    const receiptNumber = lastPayment?.receiptNumber || 
                         month.receiptNumber || 
                         (month.ledgerId ? month.ledgerId.slice(-6).toUpperCase() : '—');
    
    const issueDate = formatDate(lastPayment?.paidOn || 
                                lastPayment?.createdAt || 
                                month.updatedAt || 
                                month.generatedAt || 
                                month.dueDate || 
                                new Date());
    
    const paymentMode = String(lastPayment?.mode || 
                              (month.status === 'Paid' ? 'Cash' : entry.defaultMode) || 
                              'Cash').toUpperCase();
    
    const totalAmount = Number(month.totalAmount || month.amount || 0);
    const paidAmount = Number(month.paidAmount || 0);
    const dueAmount = Math.max(totalAmount - paidAmount, 0);
    
    // Handle fee items
    let feeItems = [];
    if (Array.isArray(month.feeItems) && month.feeItems.length > 0) {
      feeItems = month.feeItems;
    } else if (totalAmount > 0) {
      feeItems = [{ feeHead: 'Total Fees', amount: totalAmount }];
    } else {
      feeItems = [{ feeHead: 'No Fee Data', amount: 0 }];
    }
    
    const amountWords = numberToWords(paidAmount || totalAmount);

    // Generate fee table rows
    const feeRows = feeItems
      .map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${escapeHtml(item.feeHead || 'Fee Component')}</td>
          <td class="text-right">${formatCurrency(item.amount)}</td>
        </tr>
      `)
      .join('');

    const totalsRow = `
      <tr class="totals">
        <td colspan="2">Total</td>
        <td class="text-right">${formatCurrency(totalAmount)}</td>
      </tr>
    `;

    const paidRow = paidAmount > 0 ? `
      <tr class="paid-row">
        <td colspan="2">Amount Paid</td>
        <td class="text-right">${formatCurrency(paidAmount)}</td>
      </tr>
    ` : '';

    const dueRow = dueAmount > 0 ? `
      <tr class="due-row">
        <td colspan="2">Amount Due</td>
        <td class="text-right">${formatCurrency(dueAmount)}</td>
      </tr>
    ` : '';

    const receiptHtml = `
      <div class="receipt-card">
        <header class="receipt-header">
          <div>
            <h1>${escapeHtml(schoolName)}</h1>
            <p class="copy-label">${escapeHtml(copyLabel)}</p>
          </div>
          <div class="logo-holder"></div>
        </header>
        <div class="sub-header">
          <p class="receipt-line">Receipt No.: <span>${escapeHtml(receiptNumber)}</span></p>
          <p class="note">(Note: Fee bill to be paid by Crossed Cheque in School Office)</p>
          <p class="title">Fee Receipt for the month of ${escapeHtml(monthName)} ${escapeHtml(academicYear)}</p>
          <p class="received">Received from <span>${escapeHtml(studentName)}</span></p>
        </div>
        <div class="info-grid">
          <p>Class: <span>${escapeHtml(classLabel)}</span></p>
          <p>Section: <span>${escapeHtml(sectionLabel)}</span></p>
          <p>S. R. No.: <span>${escapeHtml(srNumber)}</span></p>
          <p>Due Date: <span>${escapeHtml(dueDate)}</span></p>
        </div>
        <table class="fee-table">
          <thead>
            <tr>
              <th style="width: 12%">S.No</th>
              <th>Particulars</th>
              <th style="width: 28%">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${feeRows}
            ${totalsRow}
            ${paidRow}
            ${dueRow}
          </tbody>
        </table>
        <footer class="receipt-footer">
          <div class="issue-details">
            <p>Date of Issue of Receipt : ${escapeHtml(issueDate)}</p>
            <p>Clerk's Sign</p>
          </div>
          <div class="ack-box">
            <p class="heading">RECEIPT</p>
            <p>1) Received the above amount by ${escapeHtml(paymentMode)}</p>
            <p>of Rs. ${Number(paidAmount || totalAmount).toLocaleString('en-IN')} (in words ${escapeHtml(amountWords)})</p>
          </div>
          <div class="signatures">
            <p>STAMP OF BRANCH</p>
            <p>DATE: ${escapeHtml(issueDate)}</p>
            <p>Signature of receiving Clerk/ Teacher</p>
          </div>
        </footer>
      </div>
    `;
    
    console.log('Generated receipt HTML length:', receiptHtml.length);
    return receiptHtml;
  };

  const buildLedgerDocument = (entry) => {
    console.log('Building ledger document for entry:', entry);
    
    if (!entry || !Array.isArray(entry.months) || entry.months.length === 0) {
      console.warn('No months data found for entry:', entry);
      return `
        ${RECEIPT_PDF_STYLES}
        <div class="pdf-root">
          <div class="receipt-section">
            <div class="receipt-card" style="min-height:auto;">
              <div class="sub-header">
                <p class="title">No ledger data available for download.</p>
                <p>Please ensure the student has fee records for the selected filters.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    console.log(`Generating ${entry.months.length} receipt(s) for student:`, entry.displayName);

    const receiptSections = entry.months
      .map((month, index) => {
        console.log(`Processing month ${index + 1}:`, month);
        
        // Validate month data
        if (!month.monthName || !month.totalAmount) {
          console.warn('Skipping invalid month data:', month);
          return '';
        }

        const receiptPair = `
          <div class="receipt-pair">
            ${buildReceiptCopy(entry, month, 'Office Copy')}
            ${buildReceiptCopy(entry, month, 'Student Copy')}
          </div>
        `;
        
        return `
          <section class="receipt-section">
            ${receiptPair}
          </section>
          ${index < entry.months.length - 1 ? '<div class="page-break"></div>' : ''}
        `;
      })
      .filter(section => section.trim() !== '') // Remove empty sections
      .join('');

    if (!receiptSections.trim()) {
      return `
        ${RECEIPT_PDF_STYLES}
        <div class="pdf-root">
          <div class="receipt-section">
            <div class="receipt-card" style="min-height:auto;">
              <div class="sub-header">
                <p class="title">No valid receipt data available.</p>
                <p>Please check the fee records for this student.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const fullDocument = `
      ${RECEIPT_PDF_STYLES}
      <div class="pdf-root">
        ${receiptSections}
      </div>
    `;
    
    console.log('Generated document HTML length:', fullDocument.length);
    return fullDocument;
  };

  const handleDownloadLedger = useCallback(async (entry) => {
    try {
      // Debug log to see what data we're working with
      console.log('Entry data for PDF download:', entry);
      
      if (!entry || !entry.months || entry.months.length === 0) {
        toast.error('No data available to generate PDF');
        return;
      }

      // Find the first month with a payment/receipt to download
      const monthWithReceipt = entry.months.find(month => 
        month.payments && month.payments.length > 0 && month.payments[0].receiptNumber
      );
      
      if (!monthWithReceipt) {
        toast.error('No receipt available for download');
        return;
      }

      const ledgerId = monthWithReceipt._id || monthWithReceipt.ledgerId;
      const receiptNumber = monthWithReceipt.payments[0].receiptNumber;
      
      if (!ledgerId || !receiptNumber) {
        toast.error('Invalid receipt data');
        return;
      }

      // Use the backend PDF service
      const receiptBlob = await downloadLedgerReceipt(ledgerId, receiptNumber);
      const ok = downloadBlob(receiptBlob, `receipt-${receiptNumber}.pdf`, 'application/pdf');
      
      if (!ok) {
        throw new Error('Unable to download receipt');
      }
      
      toast.success('Receipt downloaded successfully!');
      
    } catch (error) {
      console.error('Download receipt error:', error);
      toast.error(error?.message || 'Failed to download receipt');
    }
  }, []);

  // Test function to verify PDF generation
  const testPdfGeneration = useCallback(async () => {
    console.log('Testing PDF generation with sample data...');
    
    // Create sample test data
    const sampleEntry = {
      displayName: 'Test Student',
      studentId: {
        name: 'Test Student',
        admissionNumber: 'TS001',
        classId: { className: 'Class 10' },
        sectionId: { name: 'A' }
      },
      months: [
        {
          monthName: 'January 2024',
          totalAmount: 5000,
          paidAmount: 3000,
          dueAmount: 2000,
          dueDate: new Date(),
          feeItems: [
            { feeHead: 'Tuition Fee', amount: 3000 },
            { feeHead: 'Transport Fee', amount: 1500 },
            { feeHead: 'Library Fee', amount: 500 }
          ],
          payments: [
            {
              receiptNumber: 'REC001',
              amount: 3000,
              mode: 'Cash',
              paidOn: new Date()
            }
          ]
        }
      ]
    };

    try {
      await handleDownloadLedger(sampleEntry);
    } catch (error) {
      console.error('Test PDF generation failed:', error);
      toast.error('Test PDF generation failed: ' + error.message);
    }
  }, [handleDownloadLedger]);

  const handlePreviewClick = useCallback((entry) => {
    setPreviewEntry(entry);
    setPreviewModalOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewModalOpen(false);
    setPreviewEntry(null);
  }, []);

  const studentLedgers = useMemo(() => {
    if (!Array.isArray(ledgers)) return [];
    const grouped = new Map();
    ledgers.forEach((ledger) => {
      const studentRef = ledger.studentId;
      const studentKey = (studentRef && (studentRef._id || studentRef.id)) || ledger.studentId;
      if (!studentKey) return;
      
      // Extract comprehensive student information
      const studentName = formatStudentName(studentRef) || 
                         (studentRef?.name) || 
                         `${studentRef?.firstName || ''} ${studentRef?.lastName || ''}`.trim() || 
                         'Unnamed Student';
      
      // Extract school information
      const schoolInfo = ledger.schoolId || {};
      const schoolName = schoolInfo.schoolName || schoolInfo.name || schoolInfo.branchName || '';
      
      // Extract class information
      const classInfo = ledger.classId || {};
      const className = classInfo.className || classInfo.name || '';
      
      // Extract section information
      const sectionInfo = ledger.sectionId || {};
      const sectionName = sectionInfo.name || sectionInfo.section || 
                         studentRef?.sectionName || studentRef?.section || '';
      
      // Extract student identifiers
      const srNumber = studentRef?.admissionNumber || studentRef?.scholarNumber || 
                      studentRef?.applicationNumber || '';
      const rollNumber = studentRef?.rollNumber || '';
      
      // Extract session information
      const sessionInfo = ledger.sessionId || {};
      const sessionLabel = ledger.sessionLabel || sessionInfo.yearRange || sessionInfo.name || '';
      
      const existing = grouped.get(studentKey) || {
        studentId: studentRef,
        studentKey,
        displayName: studentName,
        schoolName: schoolName,
        className: className,
        section: sectionName,
        srNumber: srNumber,
        rollNumber: rollNumber,
        sessionLabel: sessionLabel,
        months: [],
        totalAssigned: 0,
        totalPaid: 0,
        totalDue: 0,
      };
      
      const monthEntry = {
        ledgerId: ledger._id,
        monthId: ledger.monthId?._id || ledger.monthId,
        monthName: ledger.monthName,
        dueDate: ledger.dueDate,
        totalAmount: Number(ledger.totalAmount || 0),
        paidAmount: Number(ledger.paidAmount || 0),
        dueAmount: Number(ledger.dueAmount || 0),
        status: ledger.status,
        feeItems: ledger.feeItems || [],
        payments: ledger.payments || [],
        receiptNumber: ledger.receiptNumber,
        generatedAt: ledger.generatedAt,
        updatedAt: ledger.updatedAt,
      };
      
      existing.months.push(monthEntry);
      existing.totalAssigned += monthEntry.totalAmount;
      existing.totalPaid += monthEntry.paidAmount;
      existing.totalDue += monthEntry.dueAmount;
      grouped.set(studentKey, existing);
    });
    return Array.from(grouped.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [ledgers]);

  const openPaymentModal = (studentEntry) => {
    if (!studentEntry) return;
    const dueMonths = studentEntry.months.filter((month) => Number(month.dueAmount || 0) > 0);
    if (dueMonths.length === 0) {
      toast.success('This student has no pending dues.');
      return;
    }
    const defaultMonth = dueMonths[0];
    setPaymentModal({
      open: true,
      student: studentEntry.studentId,
      studentName: studentEntry.displayName,
      months: dueMonths,
      selectedLedgerId: defaultMonth?.ledgerId || '',
      amount: defaultMonth ? String(defaultMonth.dueAmount || '') : '',
      mode: 'Cash',
      remark: '',
      downloadAfterSubmit: true,
      lateFeeComponent: '',
      referenceNumber: '',
      collectedBy: '',
      paidOn: '',
    });
  };

  const closePaymentModal = () =>
    setPaymentModal({
      open: false,
      student: null,
      studentName: '',
      months: [],
      selectedLedgerId: '',
      amount: '',
      mode: 'Cash',
      remark: '',
    });

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    const { selectedLedgerId, months, amount, mode, remark, downloadAfterSubmit, lateFeeComponent, referenceNumber, collectedBy, paidOn } = paymentModal;
    if (!selectedLedgerId) {
      toast.error('Select a month to record payment');
      return;
    }
    const selectedMonth = months.find((month) => month.ledgerId === selectedLedgerId);
    if (!selectedMonth) {
      toast.error('Unable to identify selected month');
      return;
    }
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (numeric > Number(selectedMonth.dueAmount || 0)) {
      toast.error('Amount exceeds outstanding due for this month');
      return;
    }
    try {
      const payload = {
        amount: numeric,
        mode,
        remark,
        lateFeeComponent: lateFeeComponent ? Number(lateFeeComponent) : undefined,
        referenceNumber: referenceNumber?.trim() || undefined,
        collectedBy: collectedBy?.trim() || undefined,
        paidOn: paidOn || undefined,
      };
      const response = await addLedgerPayment(selectedLedgerId, payload);
      toast.success('Payment recorded');
      closePaymentModal();
      fetchLedgers();

      if (downloadAfterSubmit && response?.data?.payment?.receiptNumber) {
        try {
          const receiptBlob = await downloadLedgerReceipt(response.data.ledgerId, response.data.payment.receiptNumber);
          const ok = downloadBlob(receiptBlob, `receipt-${response.data.payment.receiptNumber}.pdf`, 'application/pdf');
          if (!ok) throw new Error('Unable to download receipt');
        } catch (err) {
          console.error('Download receipt error:', err);
          toast.error('Payment saved, but receipt download failed');
        }
      }
    } catch (error) {
      console.error('Failed to add payment', error);
      toast.error(error?.message || 'Failed to add payment');
    }
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedStudent('');
  };

  const handleNotifyDefaulters = async () => {
    try {
      const payload = {
        notificationType: 'email',
        academicYear: selectedSession,
        classId: selectedClass || undefined,
      };
      const result = await sendDueFeeNotifications(schoolId, payload);
      toast.success(result?.message || 'Notifications sent');
    } catch (error) {
      console.error('Failed to notify defaulters', error);
      toast.error(error?.message || 'Failed to notify defaulters');
    }
  };

  const handleDownloadMonthlyReport = async () => {
    try {
      const blob = await generateMonthlyCollectionPdf(schoolId, { academicYear: selectedSession });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-collection-${sessionLabel || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Monthly report downloaded');
    } catch (error) {
      console.error('Failed to download monthly report', error);
      toast.error(error?.message || 'Failed to download report');
    }
  };

  const handleDownloadClassRevenue = async () => {
    try {
      const blob = await generateClassWiseRevenuePdf(schoolId, { academicYear: selectedSession });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `class-revenue-${sessionLabel || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Class revenue report downloaded');
    } catch (error) {
      console.error('Failed to download class revenue report', error);
      toast.error(error?.message || 'Failed to download report');
    }
  };

  const handleDownloadPendingVsCollected = async () => {
    try {
      const blob = await generatePendingVsCollectedPdf(schoolId, { academicYear: selectedSession });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `pending-vs-collected-${sessionLabel || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      console.error('Failed to download pending vs collected report', error);
      toast.error(error?.message || 'Failed to download report');
    }
  };

  const handleCreateLedger = async (event) => {
    event.preventDefault();
    const form = event.target;
    const studentId = form.studentId.value;
    const monthId = form.monthId.value;
    const amount = Number(form.amount.value || 0);
    if (!studentId || !monthId || amount <= 0) {
      toast.error('Fill student, month, and amount');
      return;
    }
    try {
      setCreatingLedger(true);
      await createStudentFeeLedger({
        schoolId,
        sessionId: selectedSession,
        classId: selectedClass,
        sectionId: selectedSection || null,
        studentId,
        monthId,
        feeItems: [{ feeHead: 'Custom', amount }],
        totalAmount: amount,
      });
      toast.success('Ledger created');
      form.reset();
      fetchLedgers();
    } catch (error) {
      console.error('Failed to create ledger', error);
      toast.error(error?.message || 'Failed to create ledger');
    } finally {
      setCreatingLedger(false);
    }
  };

  const handleDeleteLedger = async (ledgerId) => {
    if (!window.confirm('Delete this ledger?')) return;
    try {
      await deleteLedger(ledgerId);
      toast.success('Ledger deleted');
      fetchLedgers();
    } catch (error) {
      console.error('Failed to delete ledger', error);
      toast.error(error?.message || 'Failed to delete ledger');
    }
  };



  return (
    <div className="min-h-screen p-6">
      <div ref={pdfContainerRef} className="fixed left-[-9999px] top-[-9999px]" aria-hidden="true" />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <motion.div variants={staggerItem}>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-black text-transparent bg-clip-text"
            >
              Submit Fees (Monthly Ledger)
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-600 mt-2"
            >
              Filter outstanding ledgers, record payments, and review fee collection totals in real time.
            </motion.p>
          </motion.div>
          <motion.div 
            variants={staggerItem}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col"
            >
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="rounded-lg border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.yearRange}
                    {session.isActive ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col"
            >
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month._id} value={month._id}>
                    {month.name}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col"
            >
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                  setSelectedStudent('');
                }}
                className="rounded-lg border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                <option value="">All Classes</option>
                {filteredClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col"
            >
              <label className="text-xs font-semibold text-gray-700 mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedStudent('');
                }}
                className="rounded-lg border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                <option value="">All Sections</option>
                {filteredSections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col"
            >
              <label className="text-xs font-semibold text-gray-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="rounded-lg border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                <option value="">All Students</option>
                {filteredStudents.map((student) => {
                  const name = student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim();
                  const roll = student?.rollNumber ? ` (Roll ${student.rollNumber})` : '';
                  return (
                    <option key={student?._id} value={student?._id}>
                      {name}
                      {roll}
                    </option>
                  );
                })}
              </select>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={cardHover}
          whileHover="hover"
          className="rounded-xl border-2 border-red-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-red-100/50"
        >
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={fetchLedgers}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-red-600 transition-all duration-200"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Fees
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              Clear Filters
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={handleNotifyDefaulters}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-semibold text-yellow-900 shadow-lg shadow-yellow-500/20 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
            >
              <Bell className="h-4 w-4" /> Notify Defaulters
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={testPdfGeneration}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              <FileText className="h-4 w-4" /> Test PDF
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={handleDownloadClassRevenue}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              <PieChart className="h-4 w-4" /> Class Revenue
            </motion.button>
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={handleDownloadPendingVsCollected}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200"
            >
              Pending vs Collected
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          variants={cardHover}
          whileHover="hover"
          className="rounded-xl border-2 border-red-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-red-100/50 overflow-hidden"
        >
          <div className="flex flex-wrap gap-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 text-sm">
            <span className="font-semibold text-red-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Total Principal to Pay Now:
            </span>
            <span className="text-gray-700 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Assigned: ₹{totals.assigned.toLocaleString('en-IN')}
            </span>
            <span className="text-gray-700 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Paid: ₹{totals.paid.toLocaleString('en-IN')}
            </span>
            <span className="text-red-600 font-semibold flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Due: ₹{totals.due.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200 text-sm text-gray-700">
              <thead className="bg-gradient-to-r from-red-100 to-red-200 text-red-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Photo</th>
                  <th className="px-6 py-4 text-left font-semibold">Student</th>
                  <th className="px-6 py-4 text-left font-semibold">Pending Months</th>
                  <th className="px-6 py-4 text-left font-semibold">Next Due Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Total Fee</th>
                  <th className="px-6 py-4 text-left font-semibold">Paid</th>
                  <th className="px-6 py-4 text-left font-semibold">Due</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-red-500">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" /> Loading ledgers...
                      </div>
                    </td>
                  </tr>
                ) : ledgers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No monthly ledger rows found. Configure class plans in "Set Month-wise Class Fees".
                    </td>
                  </tr>
                ) : (
                  studentLedgers.map((entry) => {
                    const dueMonths = entry.months.filter((month) => Number(month.dueAmount || 0) > 0);
                    const nextDueDate = dueMonths
                      .map((month) => month.dueDate)
                      .filter(Boolean)
                      .sort((a, b) => new Date(a) - new Date(b))[0];
                    const statusLabel = dueMonths.length === 0 ? 'Paid' : dueMonths.length === entry.months.length ? 'Due' : 'Partially Paid';
                    const admissionNumber = entry.studentId?.admissionNumber;
                    return (
                      <motion.tr 
                        key={entry.studentKey} 
                        className="odd:bg-white even:bg-red-50/40 hover:bg-gradient-to-r from-red-50/50 to-white/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4">
                          {entry.studentId?.profilePhoto ? (
                            <div className="relative group inline-block">
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${entry.studentId.profilePhoto}`}
                                alt="Student"
                                className="w-10 h-10 rounded-full object-cover border-2 border-red-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerHTML = '<div class="w-10 h-10 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center"><User className="w-5 h-5 text-red-500" /></div>';
                                }}
                              />
                              <div className="absolute z-50 hidden group-hover:block -top-2 left-12">
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${entry.studentId.profilePhoto}`}
                                  alt="Student Photo"
                                  className="w-40 h-40 rounded-lg object-cover border-2 border-red-300 shadow-xl bg-white"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4 text-red-500" />
                              {entry.displayName || 'Unnamed Student'}
                            </span>
                            {admissionNumber && (
                              <span className="text-xs text-gray-500 flex items-center gap-1 ml-6">
                                <GraduationCap className="w-3 h-3" />
                                Adm: {admissionNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {entry.months.map((month) => {
                              const hasDue = Number(month.dueAmount || 0) > 0;
                              return (
                                <motion.span
                                  key={month.ledgerId}
                                  whileHover={{ scale: 1.05 }}
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                                    hasDue ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
                                  }`}
                                >
                                  <span>{month.monthName || '—'}</span>
                                  <span className="text-[11px] opacity-80">₹{Number(month.dueAmount || 0).toLocaleString('en-IN')}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLedger(month.ledgerId)}
                                    className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 shadow-sm hover:bg-red-100"
                                    title={`Delete ${month.monthName || 'month'} ledger`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </motion.span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {nextDueDate ? new Date(nextDueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          ₹{Number(entry.totalAssigned || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          ₹{Number(entry.totalPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-red-500" />
                          ₹{Number(entry.totalDue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            STATUS_COLORS[statusLabel] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            {Number(entry.totalDue || 0) > 0 && (
                              <motion.button
                                variants={buttonHover}
                                whileHover="hover"
                                whileTap="tap"
                                type="button"
                                onClick={() => openPaymentModal(entry)}
                                className="rounded-full bg-gradient-to-r from-green-500 to-green-600 p-2 text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-green-700 transition-all duration-200"
                                title="Submit Payment"
                              >
                                <DollarSign className="h-4 w-4" />
                              </motion.button>
                            )}
                            <motion.button
                              variants={buttonHover}
                              whileHover="hover"
                              whileTap="tap"
                              type="button"
                              onClick={() => handlePreviewClick(entry)}
                              className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-2 text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                              title="Preview PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              variants={buttonHover}
                              whileHover="hover"
                              whileTap="tap"
                              type="button"
                              onClick={() => handleDownloadLedger(entry)}
                              className="rounded-full bg-gradient-to-r from-red-500 to-red-600 p-2 text-white shadow-lg shadow-red-500/20 hover:from-red-600 hover:to-red-700 transition-all duration-200"
                              title="Download Ledger PDF"
                            >
                              <Download className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        
      </motion.div>

      <AnimatePresence>
        {paymentModal.open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            >
              <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Submit Payment
                  </h3>
                  <button
                    onClick={closePaymentModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg"
                >
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" />
                    {paymentModal.studentName}
                  </div>
                  <div>
                    Month:{' '}
                    {paymentModal.months.length ? (
                      <select
                        value={paymentModal.selectedLedgerId}
                        onChange={(e) => {
                          const ledgerId = e.target.value;
                          const selectedMonth = paymentModal.months.find((month) => month.ledgerId === ledgerId);
                          setPaymentModal((prev) => ({
                            ...prev,
                            selectedLedgerId: ledgerId,
                            amount: selectedMonth ? String(selectedMonth.dueAmount || '') : '',
                          }));
                        }}
                        className="ml-1 inline-flex rounded-lg border-2 border-red-200 px-3 py-1 text-sm text-gray-700 bg-white/80 backdrop-blur-sm"
                      >
                        {paymentModal.months.map((month) => (
                          <option key={month.ledgerId} value={month.ledgerId}>
                            {month.monthName} (Due ₹{Number(month.dueAmount || 0).toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div>
                    Outstanding:{' '}
                    ₹
                    {Number(
                      paymentModal.months.find((month) => month.ledgerId === paymentModal.selectedLedgerId)?.dueAmount || 0,
                    ).toLocaleString('en-IN')}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Amount*
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentModal.amount}
                    onChange={(e) =>
                      setPaymentModal((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-red-200 px-4 py-3 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mode*</label>
                  <select
                    value={paymentModal.mode}
                    onChange={(e) =>
                      setPaymentModal((prev) => ({
                        ...prev,
                        mode: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online</option>
                  </select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Remark</label>
                  <textarea
                    value={paymentModal.remark}
                    onChange={(e) =>
                      setPaymentModal((prev) => ({
                        ...prev,
                        remark: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                    placeholder="Optional note"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Late Fee Component</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentModal.lateFeeComponent}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          lateFeeComponent: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                      placeholder="Optional late fee amount"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reference Number</label>
                    <input
                      type="text"
                      value={paymentModal.referenceNumber}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          referenceNumber: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                      placeholder="Cheque/UTR reference"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Collected By</label>
                    <input
                      type="text"
                      value={paymentModal.collectedBy}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          collectedBy: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                      placeholder="Staff name (optional)"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Paid On</label>
                    <input
                      type="date"
                      value={paymentModal.paidOn}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          paidOn: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border-2 border-red-200 px-4 py-3 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between rounded-lg border-2 border-red-100 bg-red-50 px-4 py-3"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-red-700">
                    <input
                      type="checkbox"
                      checked={paymentModal.downloadAfterSubmit}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          downloadAfterSubmit: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    Download receipt after saving payment
                  </label>
                  <span className="text-xs text-red-500">PDF opens automatically once payment is saved.</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end gap-4"
                >
                  <motion.button
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={closePaymentModal}
                    className="rounded-lg border-2 border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-red-800 transition-all duration-200"
                  >
                    Submit Payment
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PdfPreviewModal 
        isOpen={previewModalOpen}
        onClose={handleClosePreview}
        entry={previewEntry}
        onDownload={handleDownloadLedger}
      />
    </div>
  );
};

export default SubmitFees;