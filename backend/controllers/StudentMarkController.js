const StudentMark = require("../models/studentMarkModel");
const MaxMark = require("../models/MaxMarkModel");
const TermOpenDay = require("../models/TermOpenDayModel"); 
const { getSchoolIdFromReq, isValidTerm } = require("../utils/requestUtils");
const { buildSubjectMaxMap, validateMarkAgainstMax } = require("../utils/marksUtils");

// --- 1. Get Marks Entry Data (for UI initialization) ---
// Fetches Max Marks, Open Days, and Existing Student Marks
exports.getMarksEntryData = async (req, res) => {
  try {
    const { studentId, className, section } = req.query;
    const schoolId = getSchoolIdFromReq(req);

    if (!studentId || !className || !section) {
      return res.status(400).json({ success: false, message: "studentId, className, and section are required." });
    }

    const schoolFilter = schoolId ? { $or: [ { schoolId }, { schoolId: { $exists: false } } ] } : {};

    // Parallelly fetch all required data:
    const [maxMarksDocs, openDaysDoc, studentMarksDocs] = await Promise.all([
      // 1. Max Marks for all subjects in this class/section
      MaxMark.find({ className, section, ...schoolFilter }).lean(),
      // 2. Open Days for this class/section
      TermOpenDay.findOne({ className, section, ...schoolFilter }).lean(),
      // 3. Existing marks for this student
      StudentMark.find({ studentId, className, section, ...schoolFilter }).lean(),
    ]);

    // Map Max Marks and Student Marks together for the UI structure
    const subjectsData = maxMarksDocs.map(maxMark => {
      const studentMark = studentMarksDocs.find(sm => sm.subject === maxMark.subject);
      
      // Transform MaxMark structure
      const maxMarks = {
          Term1: { i: maxMark.Term1?.i || 0, ii: maxMark.Term1?.ii || 0, iii: maxMark.Term1?.iii || 0, iv: maxMark.Term1?.iv || 0, v: maxMark.Term1?.v || 0, max: maxMark.Term1?.max || 0 },
          Term2: { i: maxMark.Term2?.i || 0, ii: maxMark.Term2?.ii || 0, iii: maxMark.Term2?.iii || 0, iv: maxMark.Term2?.iv || 0, v: maxMark.Term2?.v || 0, max: maxMark.Term2?.max || 0 },
          Term3: { i: maxMark.Term3?.i || 0, ii: maxMark.Term3?.ii || 0, iii: maxMark.Term3?.iii || 0, iv: maxMark.Term3?.iv || 0, v: maxMark.Term3?.v || 0, max: maxMark.Term3?.max || 0 },
      };

      // Transform Obtained Marks structure
      const obtainedMarks = studentMark 
        ? {
            Term1: studentMark.marks.Term1 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0 },
            Term2: studentMark.marks.Term2 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0 },
            Term3: studentMark.marks.Term3 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0 },
            daysPresent: studentMark.marks.daysPresent || 0,
          }
        : null;

      return {
        subject: maxMark.subject,
        maxMarks: maxMarks,
        obtainedMarks: obtainedMarks,
      };
    });

    const attendanceSource = Array.isArray(studentMarksDocs) && studentMarksDocs.length > 0 ? studentMarksDocs[0] : null;
    const hasPerTermAttendance = !!(attendanceSource && attendanceSource.marks && (
      (attendanceSource.marks.Term1 && typeof attendanceSource.marks.Term1.daysPresent === 'number') ||
      (attendanceSource.marks.Term2 && typeof attendanceSource.marks.Term2.daysPresent === 'number') ||
      (attendanceSource.marks.Term3 && typeof attendanceSource.marks.Term3.daysPresent === 'number')
    ));
    const responseData = {
      studentId,
      className,
      section,
      openDays: {
        term1OpenDays: openDaysDoc?.term1OpenDays || 0,
        term2OpenDays: openDaysDoc?.term2OpenDays || 0,
        term3OpenDays: openDaysDoc?.term3OpenDays || 0,
      },
      attendance: {
        Term1: Number(hasPerTermAttendance
          ? ((attendanceSource && attendanceSource.marks && attendanceSource.marks.Term1 && attendanceSource.marks.Term1.daysPresent) || 0)
          : ((attendanceSource && attendanceSource.marks && attendanceSource.marks.daysPresent) || 0)),
        Term2: Number(hasPerTermAttendance
          ? ((attendanceSource && attendanceSource.marks && attendanceSource.marks.Term2 && attendanceSource.marks.Term2.daysPresent) || 0)
          : ((attendanceSource && attendanceSource.marks && attendanceSource.marks.daysPresent) || 0)),
        Term3: Number(hasPerTermAttendance
          ? ((attendanceSource && attendanceSource.marks && attendanceSource.marks.Term3 && attendanceSource.marks.Term3.daysPresent) || 0)
          : ((attendanceSource && attendanceSource.marks && attendanceSource.marks.daysPresent) || 0)),
      },
      hasPerTermAttendance,
      subjects: subjectsData,
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Error getting marks entry data:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve marks data.", error: error.message });
  }
};

// --- 2. Set/Update Student Marks ---
exports.setStudentMarks = async (req, res) => {
  try {
    // Expected payload: { studentId, className, section, marks: [{ subject, term, i, ii, iii, daysPresent }, ...] }
    const { studentId, className, section, marks } = req.body;
    const schoolId = getSchoolIdFromReq(req);

    // Validate payload early before accessing marks[0]
    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ success: false, message: "marks array is required" });
    }

    // Use the daysPresent value from the first entry (since it's the same for all)
    const daysPresent = Number(marks?.[0]?.daysPresent || 0);

    // Load MaxMarks for validation
    const maxDocs = await MaxMark.find({ className, section, ...(schoolId ? { $or: [ { schoolId }, { schoolId: { $exists: false } } ] } : {}) }).lean();
    const maxMap = buildSubjectMaxMap(maxDocs);

    // Validate incoming marks against max
    for (const m of marks) {
      if (!m?.subject || !m?.term || !isValidTerm(m.term)) {
        return res.status(400).json({ success: false, message: `Invalid subject/term in marks entry` });
      }
      const key = String(m.subject).trim().toUpperCase();
      const maxForSubject = maxMap.get(key);
      if (!maxForSubject) {
        return res.status(400).json({ success: false, message: `Max marks not configured for subject: ${m.subject}` });
      }
      const termMax = maxForSubject[m.term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, max: 0 };
      const errs = validateMarkAgainstMax({ i: Number(m.i || 0), ii: Number(m.ii || 0), iii: Number(m.iii || 0), iv: Number(m.iv || 0), v: Number(m.v || 0) }, termMax);
      if (errs.length) {
        return res.status(400).json({ success: false, message: `Subject ${m.subject} (${m.term}): ${errs.join('; ')}` });
      }
    }

    // Validate attendance against open days for the term being saved
    const termKey = marks[0]?.term;
    if (termKey && isValidTerm(termKey)) {
      const openDaysDoc = await TermOpenDay.findOne({ className, section, ...(schoolId ? { $or: [ { schoolId }, { schoolId: { $exists: false } } ] } : {}) }).lean();
      const allowedOpenDays = termKey === 'Term1' ? (openDaysDoc?.term1OpenDays || 0)
        : termKey === 'Term2' ? (openDaysDoc?.term2OpenDays || 0)
        : (openDaysDoc?.term3OpenDays || 0);
      if (typeof daysPresent === 'number' && daysPresent > allowedOpenDays) {
        return res.status(400).json({ success: false, message: `Attendance ${daysPresent} exceeds open days ${allowedOpenDays} for ${termKey}` });
      }
    }

    const markUpdates = marks.map((markEntry) => {
      // Construct the update object for the specific term
      const termUpdate = {};
      termUpdate[`marks.${markEntry.term}.i`] = Number(markEntry.i || 0);
      termUpdate[`marks.${markEntry.term}.ii`] = Number(markEntry.ii || 0);
      termUpdate[`marks.${markEntry.term}.iii`] = Number(markEntry.iii || 0);
      termUpdate[`marks.${markEntry.term}.iv`] = Number(markEntry.iv || 0);
      termUpdate[`marks.${markEntry.term}.v`] = Number(markEntry.v || 0);
      termUpdate[`marks.${markEntry.term}.daysPresent`] = daysPresent;
      termUpdate['marks.daysPresent'] = daysPresent;
      if (schoolId) termUpdate['schoolId'] = schoolId;

      // Match existing legacy documents (no schoolId) OR the current schoolId to avoid duplicate key errors
      const baseFilter = {
        studentId,
        className,
        section,
        subject: markEntry.subject,
      };
      const filter = schoolId
        ? { ...baseFilter, $or: [{ schoolId }, { schoolId: { $exists: false } }] }
        : baseFilter;

      return StudentMark.findOneAndUpdate(
        filter,
        { $set: termUpdate },
        { upsert: true, new: true, runValidators: true }
      );
    });

    await Promise.all(markUpdates);

    res.status(200).json({ success: true, message: "Student marks updated successfully" });
  } catch (error) {
    console.error("Error setting student marks:", error);
    res.status(500).json({ success: false, message: "Failed to update student marks.", error: error.message });
  }
};