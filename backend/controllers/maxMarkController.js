const MaxMark = require("../models/MaxMarkModel");
const TermOpenDay = require("../models/TermOpenDayModel"); 
const { getSchoolIdFromReq } = require("../utils/requestUtils");

// Add or Update Max Marks AND Open Days (UPSERT Logic)
exports.setMaxMarks = async (req, res) => {
  try {
    // Expected payload: { className, section, subjects: [...], openDays: {...} }
    const { className, section, subjects, openDays } = req.body;
    const schoolId = getSchoolIdFromReq(req);

    if (!className || !section || !Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: "className, section and subjects[] are required" });
    }

    // --- 1. Subjects Max Marks Update (Parallel) ---
    // सभी सब्जेक्ट्स को एक साथ अपडेट/इन्सर्ट करने के लिए Promises का array बनाएं
    const markUpdates = subjects.map(async (sub) => {
      const subjectName = String(sub.subject || '').trim();
      if (!subjectName) return null;
      const updateDoc = { ...(schoolId ? { schoolId } : {}), className, section, subject: subjectName, Term1: sub.Term1 || {}, Term2: sub.Term2 || {}, Term3: sub.Term3 || {} };
      if (schoolId) {
        // Try migrating an existing legacy record (no schoolId) first
        const legacy = await MaxMark.findOne({ className, section, subject: subjectName, $or: [ { schoolId: { $exists: false } }, { schoolId: null } ] }).lean();
        if (legacy) {
          await MaxMark.updateOne({ _id: legacy._id }, { $set: updateDoc }, { runValidators: true });
          return null;
        }
      }
      return MaxMark.findOneAndUpdate(
        { className, section, subject: subjectName, ...(schoolId ? { schoolId } : {}) },
        { $set: updateDoc },
        { upsert: true, new: true, runValidators: true }
      );
    });
    
    // --- 2. Term Open Days Update (Separate UPSERT) ---
    let openDayUpdate = Promise.resolve(null);
    if (openDays && typeof openDays === 'object') {
      const toSet = {};
      if (typeof openDays.term1OpenDays === 'number') toSet.term1OpenDays = openDays.term1OpenDays;
      if (typeof openDays.term2OpenDays === 'number') toSet.term2OpenDays = openDays.term2OpenDays;
      if (typeof openDays.term3OpenDays === 'number') toSet.term3OpenDays = openDays.term3OpenDays;
      if (Object.keys(toSet).length) {
        if (schoolId) {
          // Try migrating existing legacy openDays first
          const legacyOD = await TermOpenDay.findOne({ className, section, $or: [ { schoolId: { $exists: false } }, { schoolId: null } ] }).lean();
          if (legacyOD) {
            openDayUpdate = TermOpenDay.updateOne(
              { _id: legacyOD._id },
              { $set: { ...(schoolId ? { schoolId } : {}), ...toSet } },
              { runValidators: true }
            );
          } else {
            openDayUpdate = TermOpenDay.findOneAndUpdate(
              { className, section, ...(schoolId ? { schoolId } : {}) },
              { $set: { ...(schoolId ? { schoolId } : {}), ...toSet } },
              { upsert: true, new: true, runValidators: true }
            );
          }
        } else {
          openDayUpdate = TermOpenDay.findOneAndUpdate(
            { className, section },
            { $set: toSet },
            { upsert: true, new: true, runValidators: true }
          );
        }
      }
    }

    // दोनों ऑपरेशंस को समानांतर (parallel) में चलाएं
    await Promise.all([...markUpdates, openDayUpdate]); 

    res.status(200).json({ success: true, message: "Max Marks and Open Days updated successfully" });
  } catch (error) {
    console.error("Error setting max marks:", error);
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate record for class/section/subject. Please reload and try again.", error: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to update data.", error: error.message });
  }
};

// Get Max Marks and Open Days by Class & Section
exports.getMaxMarks = async (req, res) => {
  try {
    const { className, section } = req.query;
    const schoolId = getSchoolIdFromReq(req);

    if (!className || !section) {
        return res.status(400).json({ success: false, message: "Class name and section are required." });
    }

    // दोनों कलेक्शन से डेटा समानांतर (parallel) में Fetch करें
    const [marks, openDays] = await Promise.all([
      // 1. Max Marks (सभी सब्जेक्ट्स)
      MaxMark.find({ className, section, ...(schoolId ? { $or: [ { schoolId }, { schoolId: { $exists: false } } ] } : {}) }).lean(),
      
      // 2. Open Days (केवल एक डॉक्यूमेंट)
      TermOpenDay.findOne({ className, section, ...(schoolId ? { $or: [ { schoolId }, { schoolId: { $exists: false } } ] } : {}) }).lean()
    ]);

    // Client को भेजने के लिए दोनों डेटा को एक ही ऑब्जेक्ट में combine करें:
    const responseData = {
      marks: marks, // Array of subject mark documents
      openDays: openDays || null // Single document or null
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error getting max marks:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve data.", error: error.message });
  }
};