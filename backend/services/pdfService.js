const PDFDocument = require('pdfkit');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Helper to generate a unique receipt number
const generateUniqueReceiptNumber = () => {
    return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const formatShortReceiptNumber = (n) => {
    if (!n) return '';
    const s = String(n);
    const m = s.match(/^REC-(\d+)(?:-([A-Za-z0-9]+))?/i);
    if (m) {
        const ts = m[1] || '';
        const rand = m[2] || '';
        const tsShort = ts.slice(-6);
        const randShort = rand ? rand.slice(0, 3).toUpperCase() : '';
        return `REC-${tsShort}${randShort ? '-' + randShort : ''}`;
    }
    const clean = s.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return clean.length > 12 ? clean.slice(0, 12) : s;
};

// Convert number to words (Indian numbering system - simplified)
function numberToWords(num) {
    if (typeof num !== 'number') num = Number(num || 0);
    if (isNaN(num)) return '';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n, s) => {
        let str = '';
        if (n > 19) str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        else str += a[n];
        return str ? str + s : '';
    };
    const numStr = ('000000000' + num).slice(-9);
    const c = numStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!c) return '';
    let words = '';
    words += (c[1] !== '00') ? inWords(parseInt(c[1]), ' Crore ') : '';
    words += (c[2] !== '00') ? inWords(parseInt(c[2]), ' Lakh ') : '';
    words += (c[3] !== '00') ? inWords(parseInt(c[3]), ' Thousand ') : '';
    words += (c[4] !== '0') ? inWords(parseInt(c[4]), ' Hundred ') : '';
    words += (c[5] !== '00') ? ((words !== '') ? 'and ' : '') + inWords(parseInt(c[5]), '') : '';
    return (words.trim() || 'Zero') + ' Only';
}

// Draw a simple grid table with headers and rows
function drawGridTable(doc, x, y, colWidths, headers, rows, opts = {}) {
    const { rowHeight = 16, headerHeight = 18, fontSize = 10, borderColor = '#000', headerFill = null, alignments = [], noHeader = false } = opts;
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const right = x + totalWidth;

    const headerH = noHeader ? 0 : headerHeight;
    const bodyH = rows.length * rowHeight;
    const boxH = headerH + bodyH;

    // Header background
    if (!noHeader && headerFill) {
        doc.save().fillColor(headerFill).rect(x, y, totalWidth, headerH).fill().restore();
    }
    // Outer border (slightly thicker for print clarity)
    doc.save().lineWidth(0.8).strokeColor(borderColor).rect(x, y, totalWidth, boxH).stroke().restore();

    // Vertical lines
    let cx = x;
    doc.save().lineWidth(0.8).strokeColor(borderColor);
    for (let i = 0; i < colWidths.length - 1; i++) {
        cx += colWidths[i];
        doc.moveTo(cx, y).lineTo(cx, y + boxH).stroke();
    }

    if (!noHeader) {
        // Header text
        doc.font('Helvetica-Bold').fontSize(fontSize);
        let tx = x;
        headers.forEach((h, i) => {
            const w = colWidths[i];
            doc.text(h, tx + 4, y + 3, { width: w - 8, align: (alignments[i] || 'left') });
            tx += w;
        });
        // Horizontal line after header
        doc.moveTo(x, y + headerH).lineTo(right, y + headerH).stroke();
    }

    // Rows
    doc.font('Helvetica').fontSize(fontSize);
    let ry = y + headerH;
    rows.forEach((row) => {
        let rx = x;
        row.forEach((cell, i) => {
            const w = colWidths[i];
            doc.text(String(cell ?? ''), rx + 4, ry + 3, { width: w - 8, align: (alignments[i] || 'left') });
            rx += w;
        });
        ry += rowHeight;
        // Row separator
        if (ry < y + boxH - 0.1) {
            doc.moveTo(x, ry).lineTo(right, ry).stroke();
        }
    });

    return y + boxH; // bottom Y
}

// Draws a single receipt copy (Office/Student) - Enhanced version
function drawReceiptCopy(doc, x, y, width, pdfData, payment, copyLabel = 'Office Copy', logoBuffer = null, studentPhotoBuffer = null) {
    const lineHeight = 10;
    const right = x + width;
    const paymentDt = new Date(payment && payment.date ? payment.date : Date.now());
    const safeDateStr = isNaN(paymentDt.getTime()) ? '' : paymentDt.toLocaleDateString('en-IN');
    const safeMonthStr = isNaN(paymentDt.getTime()) ? '' : paymentDt.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const periodLabel = (pdfData && pdfData.periodLabel) || safeMonthStr;
    const dueDateObj = pdfData && pdfData.dueDate ? new Date(pdfData.dueDate) : null;
    const dueDateLabel = dueDateObj && !isNaN(dueDateObj.getTime()) ? dueDateObj.toLocaleDateString('en-IN') : '';
    const isHexLikeId = (v) => {
        if (!v) return false;
        const s = String(v).trim();
        return /^[A-Fa-f0-9]{8,}$/.test(s);
    };

    // Border
    const availHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
    doc.lineWidth(1.0).rect(x, y, width, availHeight).stroke();

    // Header with logo - compact
    const hdrPad = 25;
    doc.font('Helvetica-Bold').fontSize(14).text(pdfData.schoolName || 'School', x + hdrPad, y + 22, { width: width - hdrPad * 2, align: 'center' });
    
    // Draw logo on the right if available (moved down a bit)
    try {
        if (logoBuffer) {
            doc.image(logoBuffer, right - 45, y + 12, { fit: [35, 35], align: 'right' });
        }
    } catch (e) {
        // Ignore logo errors
    }
    
    // Draw student photo on the left if available
    // try {
    //     if (studentPhotoBuffer) {
    //         doc.image(studentPhotoBuffer, x + 6, y + 4, { fit: [30, 30], align: 'left' });
    //     }
    // } catch (e) {
      
    // }

    // Copy label and receipt number - compact (moved down)
    let topRowY = y + 44;
    const third = width / 3;
    doc.font('Helvetica-Bold').fontSize(10).text(copyLabel, x + third, topRowY, { width: third, align: 'center' });
    
    const recShort = formatShortReceiptNumber(payment && payment.receiptNumber);
    const recText = `Receipt No.: ${recShort}`;
    doc.font('Helvetica').fontSize(9).text(recText, x + third, topRowY + 12, { width: third, align: 'center' });
    topRowY += 26;

    // Note - smaller
    const noteText = '(Note: Fee bill to be paid by Crossed Cheque in School Office)';
    doc.font('Helvetica').fontSize(8).text(noteText, x, topRowY, { width, align: 'center' });
    topRowY += 14;

    // Title
    const titleText = periodLabel ? `Fee Receipt for the month of ${periodLabel}` : 'Fee Receipt';
    doc.font('Helvetica-Bold').fontSize(10).text(titleText, x, topRowY, { width, align: 'center' });
    topRowY += 15;

    // Received from
    const studentName = (pdfData && pdfData.student && (pdfData.student.fullName || `${pdfData.student.firstName || ''} ${pdfData.student.lastName || ''}`.trim())) || '';
    const recvText = `Received from ${studentName}`;
    doc.font('Helvetica').fontSize(10).text(recvText, x + 6, topRowY, { width: width - 12, align: 'center' });
    topRowY += 14;

    // Academic Year centered after "Received from" section
    if (pdfData.sessionLabel) {
        doc.font('Helvetica').fontSize(9).text(`Academic Year: ${pdfData.sessionLabel}`, x, topRowY, { width: width, align: 'center' });
        topRowY += 16;
    }

    // Student Information in compact grid format
    const infoY = topRowY;
    doc.fontSize(7);
    const infoWidth = width - 12;
    const halfW = infoWidth / 2;
    
    const sClass = (pdfData && pdfData.class) ? (pdfData.class.className || pdfData.class.name || '') : '';
    let sSection = '';
    const sectionCandidates = [
        pdfData && pdfData.class && (pdfData.class.section || pdfData.class.sectionName),
        pdfData && pdfData.student && (pdfData.student.section || pdfData.student.sectionName)
    ];
    for (const cand of sectionCandidates) {
        if (cand && !isHexLikeId(cand)) { sSection = cand; break; }
    }
    const sSrNo = (pdfData && pdfData.student) ? (pdfData.student.srNumber || pdfData.student.srNo || pdfData.student.admissionNo || '') : '';
    const sRollNo = (pdfData && pdfData.student) ? (pdfData.student.rollNumber || '') : '';
    
    // Compact 2-row layout
    // Row 1: Class and Section
    doc.text(`Class: ${sClass || '—'}`, x + 6, infoY, { width: halfW - 3, align: 'center' });
    doc.text(`Section: ${sSection || '—'}`, x + 6 + halfW, infoY, { width: halfW - 3, align: 'center' });
    
    // Row 2: S.R. No. and Roll No.
    doc.text(`S. R. No.: ${sSrNo || '—'}`, x + 6, infoY + lineHeight, { width: halfW - 3, align: 'center' });
    doc.text(`Roll No.: ${sRollNo || '—'}`, x + 6 + halfW, infoY + lineHeight, { width: halfW - 3, align: 'center' });
    
    // Row 3: Due Date only (Academic Year will be displayed after "Received from" section)
    if (dueDateLabel) {
        doc.text(`Due Date: ${dueDateLabel}`, x + 6, infoY + lineHeight * 2, { width: halfW - 3, align: 'left' });
    }

    // Fee Components Table - more compact
    let cursorY = infoY + lineHeight * 3 + 8;
    const leftPad = 6;
    const tableX = x + leftPad;
    const tableW = width - leftPad * 2;
    const snW = 25, itemW = tableW - snW - 60, amtW = 60;
    const colW = [snW, itemW, amtW];

    // Fee components
    let compsRaw = Array.isArray(pdfData && pdfData.feeComponents) ? pdfData.feeComponents : [];
    let comps = compsRaw
        .map((c) => ({ name: c.name || c.feeHead || 'Fee Component', amount: Number(c.amount || 0) }))
        .filter((c) => c.amount > 0);
    
    // If no fee components found, try to create from total amount
    if (!comps.length) {
        const fallbackAmount = Number(payment.amount || pdfData.totalFee || 0);
        if (fallbackAmount > 0) {
            comps = [{ name: 'Total Fees', amount: fallbackAmount }];
        }
    }
    
    let principalTotal = 0;
    doc.font('Helvetica-Bold').fontSize(10).text('Fee Components:', tableX, cursorY, { align: 'center', width: tableW });
    cursorY += 12;
    
    const rows = comps.map((c, i) => {
        const lineAmount = Number(c.amount || 0);
        principalTotal += lineAmount;
        return [i + 1, c.name, `${lineAmount.toLocaleString('en-IN')}`];
    });
    
    // Add total row
    if (comps.length > 1) {
        rows.push(['', 'Total', `${principalTotal.toLocaleString('en-IN')}`]);
    }
    
    cursorY = drawGridTable(doc, tableX, cursorY + 3, colW, ['S.No', 'Particulars', 'Amount'], rows, { 
        rowHeight: 14, 
        headerHeight: 16, 
        fontSize: 9, 
        alignments: ['center', 'center', 'center'] 
    }) + 8;

    // Payment Summary Table - moved up and centered
    const paymentSummary = pdfData && pdfData.paymentSummary ? pdfData.paymentSummary : {};
    const amountPaid = Number(payment.amount || paymentSummary.amountPaidThis || 0);
    const summaryDefaults = {
        totalFee: Number(pdfData && pdfData.totalFee || principalTotal || amountPaid),
        paidBefore: Number(paymentSummary.paidBefore || 0),
        paidAfter: Number(paymentSummary.paidAfter || (Number(paymentSummary.paidBefore || 0) + amountPaid)),
        amountPaidThis: amountPaid,
        principalComponentThis: Number(payment.principalComponent || paymentSummary.principalComponentThis || amountPaid - Number(payment.lateFeeComponent || 0)),
        lateFeeThis: Number(payment.lateFeeComponent || paymentSummary.lateFeeThis || 0),
        balanceBefore: Number(paymentSummary.balanceBefore || 0),
        balanceAfter: Number(paymentSummary.balanceAfter || Math.max(0, Number(paymentSummary.totalFee || principalTotal) - Number(paymentSummary.paidAfter || amountPaid))),
    };

    const summaryRows = [
        ['Total Fee', `${summaryDefaults.totalFee.toLocaleString('en-IN')}`],
        ['Paid Before', `${summaryDefaults.paidBefore.toLocaleString('en-IN')}`],
        ['Paid This', `${summaryDefaults.amountPaidThis.toLocaleString('en-IN')}`],
    ];
    
    if (summaryDefaults.lateFeeThis > 0) {
        summaryRows.push(['Late Fee', `${summaryDefaults.lateFeeThis.toLocaleString('en-IN')}`]);
    }
    
    summaryRows.push(
        ['Total Paid', `${summaryDefaults.paidAfter.toLocaleString('en-IN')}`],
        ['Balance', `${summaryDefaults.balanceAfter.toLocaleString('en-IN')}`]
    );

    const summaryColW = [tableW - 100, 100];
    cursorY = drawGridTable(doc, tableX, cursorY, summaryColW, ['Particulars', 'Amount'], summaryRows, { 
        rowHeight: 14, 
        fontSize: 9, 
        alignments: ['center', 'center'] 
    }) + 12;



    // Receipt section at top with padding
    const principalText = summaryDefaults.principalComponentThis > 0 ? ` (Principal ₹${summaryDefaults.principalComponentThis.toLocaleString('en-IN')}${summaryDefaults.lateFeeThis > 0 ? ` + Late Fee ₹${summaryDefaults.lateFeeThis.toLocaleString('en-IN')}` : ''})` : '';
    const amtInWords = numberToWords(Math.round(amountPaid));
    
    doc.rect(x + 6, cursorY, width - 12, 65).stroke();
    doc.font('Helvetica-Bold').fontSize(10).text('RECEIPT', x + 12, cursorY + 8, { width: width - 24, align: 'center' });
    doc.font('Helvetica').fontSize(9).text(`1) Received by ${String(payment.mode || '').toUpperCase()}`, x + 12, cursorY + 22, { width: width - 24, align: 'center' });
    doc.font('Helvetica').fontSize(9).text(`Rs. ${Number(amountPaid).toLocaleString('en-IN')}${principalText}`, x + 12, cursorY + 34, { width: width - 24, align: 'center' });
    doc.font('Helvetica').fontSize(9).text(`(in words ${amtInWords})`, x + 12, cursorY + 46, { width: width - 24, align: 'center' });

    // Footer with stamps and signatures - moved to bottom
    const bottomArea = 80;
    const footerY = Math.max(y + availHeight - bottomArea, cursorY + 80);
    const issueDate = safeDateStr;
    
    const stampY = footerY + 5;
    const thirdWFooter = (width - 12) / 3;
    doc.font('Helvetica').fontSize(9).text('STAMP', x + 8, stampY, { width: thirdWFooter - 6, align: 'left' });
    doc.font('Helvetica').fontSize(9).text(`DATE: ${issueDate}`, x + 6 + thirdWFooter, stampY, { width: thirdWFooter, align: 'center' });
    
    // Signature line with border-top and padding
    const signatureY = stampY + 20;
    doc.moveTo(x + 6 + 2 * thirdWFooter - 6, signatureY - 2)
       .lineTo(x + 6 + 2 * thirdWFooter + thirdWFooter - 6 + 6, signatureY - 2)
       .lineWidth(1.2)
       .stroke();
    
    doc.font('Helvetica').fontSize(9).text('Signature', x + 6 + 2 * thirdWFooter, signatureY + 5, { width: thirdWFooter - 6, align: 'center' });
}

// Helper to attempt loading logo buffer (supports local paths and http/https URLs)
function getLogoBuffer(logoUrl) {
    return new Promise((resolve) => {
        try {
            if (!logoUrl) return resolve(null);
            // If local file path exists
            if (!/^https?:\/\//i.test(logoUrl)) {
                if (fs.existsSync(logoUrl)) {
                    try { return resolve(fs.readFileSync(logoUrl)); } catch { return resolve(null); }
                }
                return resolve(null);
            }
            // Remote URL
            const u = new URL(logoUrl);
            const client = u.protocol === 'http:' ? http : https;
            client.get({ hostname: u.hostname, path: u.pathname + (u.search || ''), protocol: u.protocol }, (res) => {
                if (res.statusCode !== 200) { res.resume(); return resolve(null); }
                const chunks = [];
                res.on('data', (d) => chunks.push(d));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            }).on('error', () => resolve(null));
        } catch (e) {
            return resolve(null);
        }
    });
}

const generateReceiptPDF = (feeData, payment) => {
    return new Promise(async (resolve, reject) => {
        try {
            const logoBuffer = await getLogoBuffer(feeData.schoolLogoUrl);
            const studentPhotoBuffer = await getLogoBuffer(feeData.student?.profilePhoto);
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 18 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Two columns layout
            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const colWidth = (pageWidth - 8) / 2; // slightly smaller gutter for wider columns
            const x1 = doc.page.margins.left;
            const x2 = x1 + colWidth + 8;
            const y = doc.page.margins.top;

            // Left: Office Copy, Right: Student Copy
            drawReceiptCopy(doc, x1, y, colWidth, feeData, payment, 'Office Copy', logoBuffer, studentPhotoBuffer);
            drawReceiptCopy(doc, x2, y, colWidth, feeData, payment, 'Student Copy', logoBuffer, studentPhotoBuffer);

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

const generateReportPDF = (title, headers, rows) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });
        doc.on('error', reject);

        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Table Headers
        let y = doc.y;
        let x = doc.x;
        const columnWidth = (doc.page.width - 2 * doc.page.margins.left) / headers.length;

        doc.font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, x + i * columnWidth, y, { width: columnWidth, align: 'left' });
        });
        doc.moveDown();
        doc.font('Helvetica');

        // Table Rows
        rows.forEach(row => {
            y = doc.y;
            row.forEach((cell, i) => {
                doc.text(cell, x + i * columnWidth, y, { width: columnWidth, align: 'left' });
            });
            doc.moveDown();
        });

        doc.end();
    });
};

module.exports = {
    generateReceiptPDF,
    generateReportPDF,
    generateUniqueReceiptNumber // Export this for use in controller
};
