const mongoose = require('mongoose');
const FeeMonth = require('../models/FeeMonth');
const ClassMonthlyFee = require('../models/ClassMonthlyFee');
const StudentFeeLedger = require('../models/StudentFeeLedger');
const Session = require('../models/sessionModel');
const FeeStructure = require('../models/feeStructureModel');
const Class = require('../models/classModel');
const Section = require('../models/section');
const Student = require('../models/studentModel');
const School = require('../models/registarSchoolModel');
const {
  objectId,
  resolveSessionContext,
  recalculateLedgerAmounts,
  syncLedgersForClassMonthlyFee,
  removeLedgersForClassMonthlyFee,
} = require('../services/fee.service');
const { generateReceiptPDF, generateUniqueReceiptNumber } = require('../services/pdfService');

const asNumber = (v, f = 0) => (Number.isFinite(+v) ? +v : f);

//
// ----------------------------- FEE MONTHS ----------------------------------
//

exports.createFeeMonth = async (req, res) => {
  try {
    const { schoolId, sessionId, name, order, dueDate, isActive = true, metadata, code } = req.body;

    if (!schoolId || !sessionId || !name) {
      return res.status(400).json({ success: false, message: 'schoolId, sessionId, name required' });
    }

    const { sessionId: resolvedSessionId, sessionLabel } =
      await resolveSessionContext(sessionId, schoolId);

    if (!resolvedSessionId) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const normalizedName = name.trim().toUpperCase();
    const requestedMonth = typeof req.body.month === 'string' ? req.body.month.trim().toUpperCase() : '';
    const requestedAcademicYear = typeof req.body.academicYear === 'string' ? req.body.academicYear.trim() : '';
    const normalizedSchoolId = objectId(schoolId) || schoolId;
    const derivedAcademicYear = (sessionLabel && sessionLabel.trim())
      || requestedAcademicYear
      || (typeof req.body.sessionLabel === 'string' ? req.body.sessionLabel.trim() : '')
      || `SESSION-${resolvedSessionId.toString()}`;
    const derivedMonthCode = requestedMonth || normalizedName;

    const baseFilter = { schoolId: normalizedSchoolId, sessionId: resolvedSessionId };

    const existingByName = await FeeMonth.findOne({ ...baseFilter, name: normalizedName });
    if (existingByName) {
      const updates = {};
      let needsSave = false;
      if (typeof isActive === 'boolean' && existingByName.isActive !== isActive) {
        updates.isActive = isActive;
        needsSave = true;
      }
      if (dueDate) {
        const due = new Date(dueDate);
        if (!existingByName.dueDate || existingByName.dueDate.getTime() !== due.getTime()) {
          updates.dueDate = due;
          needsSave = true;
        }
      }
      if (metadata) {
        updates.metadata = metadata;
        needsSave = true;
      }
      if (code && existingByName.code !== code) {
        updates.code = code;
        needsSave = true;
      }
      if (existingByName.academicYear !== derivedAcademicYear) {
        updates.academicYear = derivedAcademicYear;
        needsSave = true;
      }
      if (existingByName.month !== derivedMonthCode) {
        updates.month = derivedMonthCode;
        needsSave = true;
      }
      if (needsSave) {
        updates.updatedBy = req.user?._id || null;
        await FeeMonth.findByIdAndUpdate(existingByName._id, updates, { new: false });
      }
      return res.status(200).json({
        success: true,
        message: 'Fee month already exists',
        data: existingByName,
        alreadyExisted: true,
      });
    }

    const nextAvailableOrder = async () => {
      const maxOrderDoc = await FeeMonth.findOne(baseFilter).sort({ order: -1 }).select('order').lean();
      return Number(maxOrderDoc?.order || 0) + 1;
    };

    const orderTaken = async (orderValue) => {
      if (!Number.isFinite(orderValue) || orderValue <= 0) {
        return true;
      }
      return Boolean(await FeeMonth.exists({ ...baseFilter, order: orderValue }));
    };

    let desiredOrder = Number.isFinite(Number(order)) && Number(order) > 0 ? Number(order) : await nextAvailableOrder();
    while (await orderTaken(desiredOrder)) {
      desiredOrder += 1;
    }

    const payload = {
      schoolId: normalizedSchoolId,
      sessionId: resolvedSessionId,
      sessionLabel,
      name: normalizedName,
      code: code || normalizedName.toLowerCase(),
      academicYear: derivedAcademicYear,
      month: derivedMonthCode,
      order: desiredOrder,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      isActive,
      metadata,
      createdBy: req.user?._id || null,
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const feeMonth = await FeeMonth.create(payload);
        return res.status(201).json({
          success: true,
          message: 'Fee month created',
          data: feeMonth,
        });
      } catch (error) {
        if (error?.code === 11000) {
          if (error?.keyPattern?.order) {
            const nextOrder = await nextAvailableOrder();
            payload.order = nextOrder;
            continue;
          }
          if (error?.keyPattern?.name || error?.keyValue?.name) {
            const duplicate = await FeeMonth.findOne({ ...baseFilter, name: normalizedName });
            if (duplicate) {
              return res.status(200).json({
                success: true,
                message: 'Fee month already exists',
                data: duplicate,
                alreadyExisted: true,
              });
            }
          }
        }
        throw error;
      }
    }
    return res.status(409).json({ success: false, message: 'Unable to assign a unique order for this month' });
  } catch (error) {
    console.error('createFeeMonth', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Month order already exists for this session',
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to create fee month' });
  }
};

exports.getFeeMonths = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { sessionId } = req.query;

    const filter = { schoolId };

    if (sessionId) {
      const { sessionId: resolvedSessionId } =
        await resolveSessionContext(sessionId, schoolId);
      if (resolvedSessionId) filter.sessionId = resolvedSessionId;
    }

    const months = await FeeMonth.find(filter).sort({ order: 1 }).lean();
    return res.json({ success: true, data: months });
  } catch (error) {
    console.error('getFeeMonths', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch months' });
  }
};

exports.updateFeeMonth = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const month = await FeeMonth.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!month) {
      return res.status(404).json({ success: false, message: 'Month not found' });
    }

    return res.json({ success: true, data: month });
  } catch (error) {
    console.error('updateFeeMonth', error);
    return res.status(500).json({ success: false, message: 'Failed to update month' });
  }
};

exports.deleteFeeMonth = async (req, res) => {
  try {
    const { id } = req.params;

    await FeeMonth.findByIdAndDelete(id);
    await ClassMonthlyFee.deleteMany({ monthId: id });
    await StudentFeeLedger.deleteMany({ monthId: id });

    return res.json({ success: true, message: 'Month deleted' });
  } catch (error) {
    console.error('deleteFeeMonth', error);
    return res.status(500).json({ success: false, message: 'Failed to delete month' });
  }
};

//
// ----------------------- CLASS MONTHLY FEES --------------------------------
//

exports.createOrUpdateClassMonthlyFee = async (req, res) => {
  try {
    const {
      schoolId,
      sessionId,
      classId,
      sectionId,
      monthId,
      monthName: providedMonthName,
      feeItems = [],
      currency,
    } = req.body;

    if (!schoolId || !sessionId || !classId || !monthId) {
      return res.status(400).json({ success: false, message: 'schoolId, sessionId, classId, monthId required' });
    }

    const { sessionId: resolvedSessionId, sessionLabel } = await resolveSessionContext(sessionId, schoolId);
    if (!resolvedSessionId) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const normalizedSchoolId = objectId(schoolId) || schoolId;
    const normalizedClassId = objectId(classId) || classId;
    const normalizedSectionId = sectionId && sectionId !== 'null' && sectionId !== ''
      ? objectId(sectionId) || sectionId
      : null;
    const normalizedMonthId = objectId(monthId) || monthId;

    const monthDoc = await FeeMonth.findById(normalizedMonthId).lean();
    if (!monthDoc) {
      return res.status(404).json({ success: false, message: 'Fee month not found' });
    }

    const effectiveMonthName = (typeof providedMonthName === 'string' && providedMonthName.trim())
      ? providedMonthName.trim()
      : monthDoc.name;
    if (!effectiveMonthName) {
      return res.status(400).json({ success: false, message: 'Month name is required' });
    }

    const normalizedFeeItems = (Array.isArray(feeItems) ? feeItems : [])
      .map((item) => ({
        feeHead: typeof item?.feeHead === 'string' ? item.feeHead.trim() : '',
        amount: asNumber(item?.amount, 0),
      }))
      .filter((item) => item.feeHead);

    const totalAmount = normalizedFeeItems.reduce((sum, item) => sum + asNumber(item.amount, 0), 0);

    const filter = {
      schoolId: normalizedSchoolId,
      sessionId: resolvedSessionId,
      classId: normalizedClassId,
      sectionId: normalizedSectionId,
      monthId: normalizedMonthId,
    };

    let classFee = await ClassMonthlyFee.findOne(filter);

    if (!classFee) {
      classFee = new ClassMonthlyFee({
        ...filter,
        sessionLabel,
        monthName: effectiveMonthName,
        feeItems: normalizedFeeItems,
        totalAmount,
        currency: currency || 'INR',
        createdBy: req.user?._id || null,
        updatedBy: req.user?._id || null,
      });
    } else {
      classFee.sessionLabel = sessionLabel || classFee.sessionLabel;
      classFee.monthName = effectiveMonthName;
      classFee.sectionId = normalizedSectionId;
      classFee.feeItems = normalizedFeeItems;
      classFee.totalAmount = totalAmount;
      classFee.currency = currency || classFee.currency || 'INR';
      classFee.updatedBy = req.user?._id || classFee.updatedBy || null;
    }

    await classFee.save();
    await syncLedgersForClassMonthlyFee(classFee, { month: monthDoc });

    return res.json({ success: true, data: classFee });
  } catch (error) {
    console.error('createOrUpdateClassMonthlyFee', error);
    return res.status(500).json({ success: false, message: 'Failed to save class fee' });
  }
};

exports.getClassMonthlyFees = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { sessionId, classId, sectionId, monthId } = req.query;

    const filter = { schoolId };

    if (sessionId) {
      const { sessionId: resolvedSessionId } = await resolveSessionContext(sessionId, schoolId);
      if (resolvedSessionId) {
        filter.sessionId = resolvedSessionId;
      }
    }
    if (classId) {
      filter.classId = objectId(classId) || classId;
    }
    if (sectionId) {
      filter.sectionId = objectId(sectionId) || sectionId;
    }
    if (monthId) {
      filter.monthId = objectId(monthId) || monthId;
    }

    const classFees = await ClassMonthlyFee.find(filter)
      .populate('classId', 'className')
      .populate('sectionId', 'name')
      .populate('monthId', 'name order dueDate')
      .sort({ sessionLabel: -1, 'monthId.order': 1 });

    return res.json({ success: true, data: classFees });
  } catch (error) {
    console.error('getClassMonthlyFees', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch class fees' });
  }
};

exports.deleteClassMonthlyFee = async (req, res) => {
  try {
    const { id } = req.params;

    const classMonthlyFee = await ClassMonthlyFee.findByIdAndDelete(id);
    if (!classMonthlyFee) {
      return res.status(404).json({ success: false, message: 'Class fee not found' });
    }

    await removeLedgersForClassMonthlyFee(classMonthlyFee);

    return res.json({ success: true, message: 'Class fee deleted' });
  } catch (error) {
    console.error('deleteClassMonthlyFee', error);
    return res.status(500).json({ success: false, message: 'Failed to delete class fee' });
  }
};

//
// --------------------------- STUDENT LEDGERS -------------------------------
//

exports.getStudentFeeLedgers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { sessionId, classId, sectionId, monthId, studentId, status } = req.query;

    const normalizedSchoolId = objectId(schoolId) || schoolId;

    const filter = { schoolId: normalizedSchoolId };

    if (sessionId) {
      const { sessionId: resolvedSessionId } = await resolveSessionContext(sessionId, schoolId);
      if (resolvedSessionId) {
        filter.sessionId = resolvedSessionId;
      } else if (mongoose.Types.ObjectId.isValid(sessionId)) {
        filter.sessionId = mongoose.Types.ObjectId.createFromHexString(sessionId);
      } else {
        filter.sessionLabel = sessionId;
      }
    }

    const normalizeMatchId = (value) => {
      if (value === undefined || value === null) return null;
      const trimmed = String(value).trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
      }
      return objectId(trimmed) || trimmed;
    };

    const normalizedClassId = normalizeMatchId(classId);
    if (normalizedClassId) {
      filter.classId = normalizedClassId;
    }

    const normalizedSectionId = normalizeMatchId(sectionId);
    if (normalizedSectionId) {
      filter.sectionId = normalizedSectionId;
    }

    const normalizedMonthId = normalizeMatchId(monthId);
    if (normalizedMonthId) {
      filter.monthId = normalizedMonthId;
    }

    const normalizedStudentId = normalizeMatchId(studentId);
    if (normalizedStudentId) {
      filter.studentId = normalizedStudentId;
    }

    const statusFilter = Array.isArray(status)
      ? status
      : typeof status === 'string' && status
        ? status.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    if (statusFilter.length === 1) {
      filter.status = statusFilter[0];
    } else if (statusFilter.length > 1) {
      filter.status = { $in: statusFilter };
    }

    const ledgers = await StudentFeeLedger.find(filter)
      .populate('studentId', 'name firstName lastName rollNumber admissionNumber scholarNumber sectionName')
      .populate('classId', 'className section')
      .populate('sectionId', 'name')
      .populate('monthId', 'name order dueDate')
      .populate('schoolId', 'schoolName branchName city logoUrl')
      .populate('sessionId', 'yearRange isActive')
      .sort({ 'monthId.order': 1, monthName: 1, createdAt: 1 })
      .lean();

    return res.json({ success: true, data: ledgers });
  } catch (error) {
    console.error('getStudentFeeLedgers', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch ledgers' });
  }
};

exports.createStudentFeeLedger = async (req, res) => {
  try {
    const {
      schoolId,
      sessionId,
      classId,
      sectionId,
      studentId,
      monthId,
      feeItems = [],
      dueDate,
      totalAmount,
    } = req.body;

    if (!schoolId || !sessionId || !classId || !studentId || !monthId) {
      return res.status(400).json({ success: false, message: 'schoolId, sessionId, classId, studentId, monthId required' });
    }

    const { sessionId: resolvedSessionId, sessionLabel } = await resolveSessionContext(sessionId, schoolId);
    if (!resolvedSessionId) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const month = await FeeMonth.findById(monthId);
    if (!month) {
      return res.status(404).json({ success: false, message: 'Fee month not found' });
    }

    const amountTotal = asNumber(totalAmount, NaN);
    const computedTotal = Number.isFinite(amountTotal)
      ? amountTotal
      : feeItems.reduce((sum, item) => sum + asNumber(item.amount), 0);

    const ledger = await StudentFeeLedger.create({
      schoolId,
      sessionId: resolvedSessionId,
      sessionLabel,
      classId,
      sectionId: sectionId || null,
      studentId,
      monthId: month._id,
      monthName: month.name,
      dueDate: dueDate ? new Date(dueDate) : month.dueDate,
      feeItems: feeItems.map((item) => ({
        feeHead: item.feeHead,
        amount: asNumber(item.amount),
      })),
      totalAmount: computedTotal,
      paidAmount: 0,
      dueAmount: computedTotal,
      status: 'Due',
      payments: [],
      autoGeneratedFrom: null,
      generatedAt: new Date(),
    });

    return res.status(201).json({ success: true, data: ledger });
  } catch (error) {
    console.error('createStudentFeeLedger', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ledger already exists for this month and student' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create ledger' });
  }
};

exports.addLedgerPayment = async (req, res) => {
  try {
    const { ledgerId } = req.params;
    const { amount, mode, referenceNumber, remark, paidOn, collectedBy, lateFeeComponent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ledgerId)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger id' });
    }

    const paymentAmount = asNumber(amount, NaN);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    if (!mode || typeof mode !== 'string') {
      return res.status(400).json({ success: false, message: 'Payment mode is required' });
    }

    const ledger = await StudentFeeLedger.findById(ledgerId);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }

    const receiptNumber = generateUniqueReceiptNumber();
    const payment = {
      amount: paymentAmount,
      mode,
      receiptNumber,
      lateFeeComponent: Math.max(asNumber(lateFeeComponent, 0), 0),
      referenceNumber: referenceNumber || undefined,
      remark: remark || undefined,
      collectedBy: collectedBy || req.user?._id || undefined,
      paidOn: paidOn ? new Date(paidOn) : new Date(),
    };

    ledger.payments.push(payment);
    recalculateLedgerAmounts(ledger);
    await ledger.save();

    const latestPayment = ledger.payments[ledger.payments.length - 1];

    return res.json({
      success: true,
      data: {
        payment: latestPayment,
        ledgerId: ledger._id,
        totals: {
          paidAmount: ledger.paidAmount,
          dueAmount: ledger.dueAmount,
          status: ledger.status,
        },
      },
    });
  } catch (error) {
    console.error('addLedgerPayment', error);
    return res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
};

exports.getLedgerReceiptPdf = async (req, res) => {
  try {
    const { ledgerId, receiptNumber } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ledgerId)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger id' });
    }

    const ledger = await StudentFeeLedger.findOne({ _id: ledgerId, 'payments.receiptNumber': receiptNumber })
      .populate('studentId', 'name firstName lastName admissionNumber scholarNumber applicationNumber rollNumber section sectionName schoolId profilePhoto')
      .populate('classId', 'className')
      .populate('sectionId', 'name')
      .populate('monthId', 'name')
      .lean();

    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const payment = (ledger.payments || []).find((item) => item.receiptNumber === receiptNumber);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for the given receipt number' });
    }

    const school = await School.findById(ledger.schoolId).lean();
    const student = ledger.studentId || {};
    const classInfo = ledger.classId || {};
    const sectionInfo = ledger.sectionId || {};

    const studentFullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
    const sectionLabel = sectionInfo.name || student.sectionName || student.section || '';
    const periodLabel = [ledger.monthName, ledger.sessionLabel].filter(Boolean).join(' ');

    const totalFee = Number(ledger.totalAmount || 0);
    const paidAfter = Number(ledger.paidAmount || 0);
    const amountPaidThis = Number(payment.amount || 0);
    const lateFeeThis = Number(payment.lateFeeComponent || 0);
    const paidBefore = Math.max(paidAfter - amountPaidThis, 0);
    const balanceAfter = Math.max(Number(ledger.dueAmount || 0), 0);
    const balanceBefore = Math.max(totalFee - paidBefore, 0);
    const principalComponentThis = Math.max(amountPaidThis - lateFeeThis, 0);

    const pdfData = {
      student: {
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullName: studentFullName || 'Unnamed Student',
        srNumber: student.admissionNumber || student.scholarNumber || student.applicationNumber || '',
        rollNumber: student.rollNumber || '',
        section: sectionLabel,
        profilePhoto: student.profilePhoto || '',
      },
      class: {
        className: classInfo.className || '',
        section: sectionLabel,
      },
      sessionLabel: ledger.sessionLabel,
      periodLabel,
      dueDate: ledger.dueDate,
      totalFee: ledger.totalAmount,
      feeComponents: Array.isArray(ledger.feeItems)
        ? ledger.feeItems.map((item) => ({ name: item.feeHead, amount: Number(item.amount || 0) }))
        : [],
      paymentSummary: {
        totalFee,
        paidBefore,
        paidAfter,
        amountPaidThis,
        principalComponentThis,
        lateFeeThis,
        balanceBefore,
        balanceAfter,
      },
      schoolName: school?.schoolName || school?.name || '',
      branchName: school?.branchName || '',
      schoolCity: school?.city || '',
      schoolLogoUrl: school?.logoUrl || null,
    };

    const paymentPayload = {
      ...payment,
      amount: Number(payment.amount || 0),
      mode: payment.mode,
      date: payment.paidOn || payment.date || new Date(),
      lateFeeComponent: Number(payment.lateFeeComponent || 0),
      principalComponent: principalComponentThis,
    };

    const buffer = await generateReceiptPDF(pdfData, paymentPayload);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receiptNumber}.pdf`);
    return res.send(buffer);
  } catch (error) {
    console.error('getLedgerReceiptPdf', error);
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF' });
  }
};

exports.deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;

    const ledger = await StudentFeeLedger.findByIdAndDelete(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }

    return res.json({ success: true, message: 'Ledger deleted' });
  } catch (error) {
    console.error('deleteLedger', error);
    return res.status(500).json({ success: false, message: 'Failed to delete ledger' });
  }
};

//
// --------------------------- DEPENDENCIES ----------------------------------
//

exports.getDependencies = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const [sessions, classes, sections, feeStructures] = await Promise.all([
      Session.find({ schoolId }).lean(),
      Class.find({ schoolId }).lean(),
      Section.find({ schoolId }).lean(),
      FeeStructure.find({ schoolId, frequency: 'monthly', isActive: true }).lean(),
    ]);

    return res.json({
      success: true,
      data: { sessions, classes, sections, feeStructures },
    });
  } catch (error) {
    console.error('getDependencies', error);
    return res.status(500).json({ success: false });
  }
};

exports.getSessionSummary = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const sessions = await Session.find({ schoolId }).sort({ startDate: -1 }).lean();

    return res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('getSessionSummary', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};
