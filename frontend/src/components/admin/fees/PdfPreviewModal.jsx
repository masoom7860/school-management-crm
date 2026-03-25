import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

// Helper function to resolve asset URLs
const resolveAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (assetPath.startsWith('http')) return assetPath;
  if (assetPath.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${assetPath}`;
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${assetPath}`;
};

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

const formatStudentName = (student) => {
  if (!student) return 'Unnamed Student';
  if (typeof student === 'string') return student;
  if (student.name) return student.name;
  const parts = [student.firstName, student.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Unnamed Student';
};

const RECEIPT_PDF_STYLES = `
  <style>
    @page { 
      size: A4 landscape; 
      margin: 15mm; 
    }
    * { 
      box-sizing: border-box; 
    }
    body { 
      margin: 0; 
      font-family: 'Times New Roman', serif; 
      color: #0f172a; 
      background: #ffffff; 
      font-size: 18px;
      line-height: 1.5;
    }
    .pdf-root { 
      display: flex; 
      flex-direction: column; 
      gap: 8mm; 
      margin: 0 auto; 
      background: #ffffff;
      width: 100%;
      min-height: 100vh;
    }
    .receipt-section { 
      page-break-inside: avoid; 
      width: 100%;
    }
    .receipt-pair { 
      display: grid; 
      grid-template-columns: repeat(2, minmax(0, 1fr)); 
      gap: 3mm; 
      width: 100%;
    }
    .receipt-card { 
      border: 3px solid #000; 
      padding: 15mm 12mm; 
      display: flex; 
      flex-direction: column; 
      gap: 10mm; 
      min-height: 180mm;
      background: #ffffff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      width: 100%;
    }
    .receipt-header { 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center;
      text-align: center;
      margin-bottom: 8mm;
      width: 100%;
      position: relative;
    }
    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .receipt-header h1 { 
      margin: 0; 
      font-size: 28px; 
      letter-spacing: 0.6px; 
      text-transform: uppercase; 
      font-weight: bold;
      text-align: center;
    }
    .copy-label { 
      font-size: 18px; 
      margin-top: 4mm; 
      font-weight: 800; 
      letter-spacing: 0.7px; 
      color: #374151;
      text-align: center;
    }
    .logo-container { 
      width: 45mm; 
      height: 45mm; 
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5mm;
    }
    .logo-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      text-align: center;
    }
    .logo-placeholder { 
      width: 100%;
      height: 100%;
      border: 3px dashed #9ca3af; 
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 16px;
    }
    .student-photo-container { 
      position: absolute;
      top: 15mm;
      right: 15mm;
      width: 35mm; 
      height: 35mm; 
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .student-photo {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
      text-align: center;
    }
    .sub-header { 
      text-align: center; 
      display: flex; 
      flex-direction: column; 
      gap: 5mm; 
      margin-bottom: 10mm;
    }
    .sub-header p { 
      margin: 0; 
      font-size: 18px; 
    }
    .title { 
      font-weight: 800; 
      text-transform: uppercase; 
      font-size: 20px;
    }
    .received span { 
      font-weight: 800; 
      text-decoration: underline;
    }
    .receipt-line {
      font-weight: 700;
      font-size: 20px;
    }
    .note {
      font-style: italic;
      color: #6b7280;
      font-size: 16px;
    }
    .info-grid { 
      display: flex;
      flex-direction: column;
      gap: 3mm; 
      font-size: 17px; 
      margin-bottom: 10mm;
      width: 100%;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      gap: 10mm;
    }
    .info-row p { 
      margin: 0; 
      padding: 1.5mm 0;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
    .info-grid span { 
      font-weight: 800; 
      color: #1f2937;
    }
    .fee-table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 17px; 
      margin-bottom: 10mm;
    }
    .fee-table th, .fee-table td { 
      border: 3px solid #000; 
      padding: 10px 12px; 
    }
    .fee-table th { 
      text-align: center; 
      font-weight: 800; 
      background-color: #f3f4f6;
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
      font-weight: 800; 
      background-color: #f9fafb;
    }
    .receipt-footer { 
      display: flex; 
      flex-direction: column; 
      gap: 8mm; 
      font-size: 17px; 
    }
    .receipt-footer .issue-details { 
      display: flex; 
      justify-content: space-between; 
      padding: 5mm 0;
      border-top: 2px solid #d1d5db;
    }
    .receipt-footer .ack-box { 
      border: 3px solid #000; 
      padding: 10mm; 
      text-align: center; 
      background-color: #f9fafb;
    }
    .receipt-footer .ack-box .heading { 
      font-weight: 800; 
      margin-bottom: 5mm; 
      font-size: 22px;
      color: #1f2937;
    }
    .receipt-footer .signatures { 
      display: flex; 
      justify-content: space-between; 
      margin-top: 20mm;
      padding-top: 2mm;
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
    
    .receipt-box-top {
      margin: 15px 0;
      padding: 12px;
      border: 1px solid #000;
      text-align: center;
    }
    
    .ack-box-content {
      font-size: 14px;
    }
    
    .receipt-heading {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .summary-table {
      width: 100%;
      margin: 15px 0;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .summary-table th,
    .summary-table td {
      padding: 6px 8px;
      border: 1px solid #000;
      text-align: center;
    }
    
    .summary-table .text-center {
      text-align: center;
    }
    
    .academic-year {
      font-size: 14px;
      margin: 15px 0;
    }
  </style>
`;

const buildReceiptCopy = (entry, month, copyLabel, schoolLogoUrl) => {
  // Validate required data
  if (!entry || !month) {
    console.error('Missing entry or month data');
    const logoHtml = schoolLogoUrl ? `
        <div class="logo-container">
          <img src="${escapeHtml(schoolLogoUrl)}" alt="School Logo" class="logo-image" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'logo-placeholder\\'>NO LOGO</div>'" />
        </div>` : `
        <div class="logo-container">
          <div class="logo-placeholder">NO LOGO</div>
        </div>`;
    
    return `
      <div class="receipt-card">
        <header class="receipt-header">
          ${logoHtml}
          <h1>${escapeHtml(schoolName)}</h1>
          <p class="copy-label">${escapeHtml(copyLabel)}</p>
        </header>
        <div class="sub-header">
          <p class="title">Error: Missing data for receipt generation</p>
        </div>
      </div>
    `;
  }

  // Extract comprehensive student information
  const student = entry.studentId || {};
  const studentName = entry.displayName || 
                     formatStudentName(student) || 
                     student.name || 
                     `${student.firstName || ''} ${student.lastName || ''}`.trim() || 
                     'Unnamed Student';
  
  // Extract school information
  const school = entry.schoolId || {};
  const schoolName = entry.schoolName || 
                    school.schoolName || 
                    school.name || 
                    school.branchName || 
                    'School Receipt';
  
  // Extract class information
  const classInfo = entry.classId || {};
  const classLabel = entry.className || 
                    classInfo.className || 
                    classInfo.name || 
                    '—';
  
  // Extract section information
  const sectionInfo = entry.sectionId || {};
  const sectionLabel = entry.section || 
                      sectionInfo.name || 
                      sectionInfo.section || 
                      student.sectionName || 
                      student.section || 
                      '—';
  
  // Extract student identifiers
  const srNumber = entry.srNumber || 
                  student.admissionNumber || 
                  student.scholarNumber || 
                  student.applicationNumber || 
                  '—';
  
  const rollNumber = student.rollNumber || '—';
  
  // Extract session information
  const session = entry.sessionId || {};
  const academicYear = entry.sessionLabel || 
                      session.yearRange || 
                      session.name || 
                      '—';
  
  // Extract month information
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
  
  // Handle fee items - show detailed breakdown
  let feeItems = [];
  if (Array.isArray(month.feeItems) && month.feeItems.length > 0) {
    feeItems = month.feeItems;
  } else if (totalAmount > 0) {
    feeItems = [{ feeHead: 'Total Fees', amount: totalAmount }];
  } else {
    feeItems = [{ feeHead: 'No Fee Data', amount: 0 }];
  }
    
  const amountWords = numberToWords(paidAmount || totalAmount);
  
  // Generate fee table rows with detailed breakdown
  const feeRows = feeItems
    .filter(item => Number(item.amount || 0) > 0) // Only show items with amount > 0
    .map((item, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-center">${escapeHtml(item.feeHead || 'Fee Component')}</td>
        <td class="text-center">${Number(item.amount || 0).toLocaleString('en-IN')}</td>
      </tr>
    `)
    .join('');
    
  // Add total row if there are multiple fee items
  const totalRow = feeItems.length > 1 && feeItems.some(item => Number(item.amount || 0) > 0) ? `
    <tr class="totals">
      <td></td>
      <td class="text-center">Total</td>
      <td class="text-center">${totalAmount.toLocaleString('en-IN')}</td>
    </tr>
  ` : '';
    
  const paidRow = paidAmount > 0 ? `
    <tr class="paid-row">
      <td colspan="2">Amount Paid</td>
      <td class="text-center">${paidAmount.toLocaleString('en-IN')}</td>
    </tr>
  ` : '';
    
  const dueRow = dueAmount > 0 ? `
    <tr class="due-row">
      <td colspan="2">Amount Due</td>
      <td class="text-center">${dueAmount.toLocaleString('en-IN')}</td>
    </tr>
  ` : '';

  const studentPhotoUrl = student.profilePhoto ? resolveAssetUrl(student.profilePhoto) : '';

  const logoHtml = schoolLogoUrl ? `
        <div class="logo-container">
          <img src="${escapeHtml(schoolLogoUrl)}" alt="School Logo" class="logo-image" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'logo-placeholder\\'>NO LOGO</div>'" />
        </div>` : `
        <div class="logo-container">
          <div class="logo-placeholder">NO LOGO</div>
        </div>`;

  const studentPhotoHtml = studentPhotoUrl ? `
        <div class="student-photo-container">
          <img src="${escapeHtml(studentPhotoUrl)}" alt="Student Photo" class="student-photo" />
        </div>` : '';

  const receiptHtml = `
    <div class="receipt-card">
      <header class="receipt-header">
        <div class="header-content">
          ${logoHtml}
          <h1>${escapeHtml(schoolName)}</h1>
          <p class="copy-label">${escapeHtml(copyLabel)}</p>
          <p class="receipt-line">Receipt No.: <span>${escapeHtml(receiptNumber)}</span></p>
        </div>
        ${studentPhotoHtml}
      </header>
      <div class="sub-header">
        <p class="note">(Note: Fee bill to be paid by Crossed Cheque in School Office)</p>
        <p class="title">Fee Receipt for the month of ${escapeHtml(monthName)} ${escapeHtml(academicYear)}</p>
        <p class="received">Received from <span>${escapeHtml(studentName)}</span></p>
        <p class="academic-year" style="text-align: center; font-size: 14px; margin: 10px 0;">
          Academic Year: ${escapeHtml(academicYear)}
        </p>
      </div>
      <div class="info-grid">
        <div class="info-row">
          <p>Class: <span>${escapeHtml(classLabel)}</span></p>
          <p>Section: <span>${escapeHtml(sectionLabel)}</span></p>
        </div>
        <div class="info-row">
          <p>S. R. No.: <span>${escapeHtml(srNumber)}</span></p>
          <p>Roll No.: <span>${escapeHtml(rollNumber)}</span></p>
        </div>
        <div class="info-row">
          <p>Due Date: <span>${escapeHtml(dueDate)}</span></p>
        </div>
      </div>
      
      <!-- Receipt section moved to top -->
      <div class="receipt-box-top">
        <div class="ack-box-content">
          <p class="receipt-heading">RECEIPT</p>
          <p>1) Received by ${escapeHtml(paymentMode)}</p>
          <p>Rs. ${Number(paidAmount || totalAmount).toLocaleString('en-IN')} (in words ${escapeHtml(amountWords)})</p>
        </div>
      </div>
      
      <table class="fee-table">
        <thead>
          <tr>
            <th style="width: 9%">S.No</th>
            <th>Particulars</th>
            <th style="width: 28%">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${feeRows}
          ${totalRow}
        </tbody>
      </table>
      
      <table class="summary-table">
        <thead>
          <tr>
            <th>Particulars</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Fee</td>
            <td>${formatCurrency(totalAmount).replace('₹', '')}</td>
          </tr>
          <tr>
            <td>Paid Before</td>
            <td>${formatCurrency(0).replace('₹', '')}</td>
          </tr>
          <tr>
            <td>Paid This</td>
            <td>${formatCurrency(paidAmount).replace('₹', '')}</td>
          </tr>
          ${paidRow.replace(/₹/g, '')}
          ${dueRow.replace(/₹/g, '')}
        </tbody>
      </table>
    
      <footer class="receipt-footer">
        <div class="signatures">
          <p>STAMP</p>
          <p>DATE: ${escapeHtml(issueDate)}</p>
          <p class="signature-line">Signature</p>
        </div>
      </footer>
    </div>
  `;
  
  console.log('Generated receipt with data:', {
    studentName,
    schoolName,
    classLabel,
    sectionLabel,
    srNumber,
    rollNumber,
    academicYear,
    monthName,
    totalAmount,
    paidAmount,
    dueAmount
  });
  
  return receiptHtml;
};

const buildLedgerDocument = (entry, schoolLogoUrl) => {
  console.log('Building ledger document for entry:', entry);
  
  if (!entry || !Array.isArray(entry.months) || entry.months.length === 0) {
    console.warn('No months data found for entry:', entry);
    return `
      ${RECEIPT_PDF_STYLES}
      <div class="pdf-root">
        <div class="receipt-section">
          <div class="receipt-card" style="min-height:auto;">
            <div class="sub-header">
              <p class="title">No ledger data available for preview.</p>
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
          ${buildReceiptCopy(entry, month, 'Office Copy', schoolLogoUrl)}
          ${buildReceiptCopy(entry, month, 'Student Copy', schoolLogoUrl)}
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

const PdfPreviewModal = ({ isOpen, onClose, entry, onDownload }) => {
  const previewRef = useRef(null);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState('');
  
  // Fetch school logo when modal opens
  useEffect(() => {
    if (isOpen && entry) {
      const fetchSchoolLogo = async () => {
        try {
          // Check if schoolId is available in entry
          const schoolId = entry.schoolId?._id || entry.schoolId;
          console.log('Fetching logo for schoolId:', schoolId);
          if (!schoolId) {
            console.warn('No schoolId found in entry');
            return;
          }
          
          const token = localStorage.getItem('token');
          const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          
          const response = await axios.get(`${baseURL}/registerSchool/get/${schoolId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          console.log('School API response:', response.data);
          const schoolData = response.data.school;
          console.log('School data:', schoolData);
          
          if (schoolData && schoolData.logoUrl) {
            console.log('Logo URL found:', schoolData.logoUrl);
            // Handle relative path for logo URL
            const logoUrl = schoolData.logoUrl.startsWith('/') 
              ? `${baseURL}${schoolData.logoUrl}`
              : schoolData.logoUrl;
            console.log('Final logo URL:', logoUrl);
            setSchoolLogoUrl(logoUrl);
          } else {
            console.log('No logo URL found in school data');
          }
        } catch (error) {
          console.error('Error fetching school logo:', error);
          console.error('Error details:', error.response?.data || error.message);
          // If there's an error, we'll still proceed with the preview
          // The logo will be empty and the placeholder will be shown
        }
      };
      
      fetchSchoolLogo();
    }
  }, [isOpen, entry]);

  const handleDownloadClick = useCallback(() => {
    if (onDownload && entry) {
      onDownload(entry);
    }
  }, [onDownload, entry]);

  useEffect(() => {
    if (isOpen && entry && previewRef.current) {
      try {
        console.log('Previewing entry data:', entry);
        console.log('Preview entry months:', entry?.months);
        
        if (!entry || !entry.months || entry.months.length === 0) {
          toast.error('No data available to preview');
          onClose();
          return;
        }

        // Build the document HTML
        const documentHtml = buildLedgerDocument(entry, schoolLogoUrl); // Pass the fetched logo URL
        console.log('Generated preview HTML length:', documentHtml.length);
        
        if (!documentHtml || documentHtml.length < 100) {
          toast.error('Failed to generate preview content');
          onClose();
          return;
        }

        // Set up container for preview with explicit sizing
        previewRef.current.innerHTML = documentHtml;
        
        // Force reflow and ensure styles are applied
        previewRef.current.style.width = 'auto';
        previewRef.current.style.minWidth = '850px';
        previewRef.current.style.padding = '20px';
        previewRef.current.style.backgroundColor = '#ffffff';
        
        // Trigger reflow
        previewRef.current.offsetHeight;
        
      } catch (error) {
        console.error('Preview error:', error);
        toast.error(error?.message || 'Failed to generate preview');
        onClose();
      }
    }
  }, [isOpen, entry, onClose, schoolLogoUrl]); // Add schoolLogoUrl to dependency array

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
  {/* Header */}
  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            PDF Preview
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
  {/* Content */}
  <div className="overflow-auto p-4 bg-white" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div 
            ref={previewRef}
            className="bg-white p-6 rounded-xl shadow-xl"
            style={{ 
              minWidth: '1200px',
              width: 'fit-content',
              margin: '0 auto',
              border: '2px solid #e5e7eb'
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PdfPreviewModal;