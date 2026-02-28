const Certificate = require("../models/certificateModel");
const Student = require("../models/studentModel");
const Section = require("../models/section");

// Helper to auto-generate unique certificate numbers
// Format: CERT-<school>-<year>-<sequence>
const generateCertificateNumber = async (schoolId) => {
  const year = new Date().getFullYear();
  const schoolSuffix = schoolId.toString().slice(-6).toUpperCase();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const count = await Certificate.countDocuments({
    schoolId,
    createdAt: { $gte: start, $lt: end },
  });

  // Try a few times in case of race conditions
  for (let i = 0; i < 5; i++) {
    const seq = (count + 1 + i).toString().padStart(5, "0");
    const candidate = `CERT-${schoolSuffix}-${year}-${seq}`;
    const exists = await Certificate.findOne({ certificateNumber: candidate });
    if (!exists) return candidate;
  }
  // Fallback to timestamp-based unique number
  return `CERT-${schoolSuffix}-${year}-${Date.now().toString().slice(-6)}`;
};

// ➕ Create Certificate
exports.createCertificate = async (req, res) => {
  try {
    const { certificateNumber, studentId, sessionId } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Get schoolId from token (preferred) or body
    const tokenSchoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    const schoolId = req.body.schoolId || tokenSchoolId;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required. Please provide it or ensure you are authenticated." });
    }

    // Verify token schoolId matches provided schoolId (security check)
    if (tokenSchoolId && tokenSchoolId.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "You can only create certificates for your school" });
    }

    // Check if certificate number already exists
    if (certificateNumber) {
      const exists = await Certificate.findOne({ certificateNumber, schoolId });
      if (exists) {
        return res.status(400).json({ message: "Certificate number already exists for this school" });
      }
    }

    // Verify student exists and belongs to school
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ message: "Student not found or does not belong to this school" });
    }

    // Set issuedBy from token if available
    const issuedBy = req.decodedToken?.adminId || req.user?.adminId || req.user?._id;

    // Determine final certificate number (auto-generate if not provided)
    let finalCertificateNumber = certificateNumber;
    if (!finalCertificateNumber) {
      finalCertificateNumber = await generateCertificateNumber(schoolId);
    }

    const certificateData = {
      ...req.body,
      schoolId: schoolId,
      issuedBy: issuedBy || req.body.issuedBy,
      certificateNumber: finalCertificateNumber,
    };

    const certificate = new Certificate(certificateData);
    await certificate.save();

    // Populate the created certificate
    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate("sessionId", "yearRange")
      .populate({
        path: "studentId",
        select: "name rollNumber email",
        populate: [
          {
            path: "classId",
            select: "className",
          },
          {
            path: "sectionId",
            select: "name",
          },
        ],
      });

    res.status(201).json({
      message: "Certificate created successfully",
      success: true,
      data: populatedCertificate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating certificate", error: error.message });
  }
};

// 📄 Get All Certificates for a School
exports.getCertificatesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const certificates = await Certificate.find({ schoolId })
      .populate("issuedBy", "name email")
      .populate("sessionId", "yearRange")
      .populate({
        path: "studentId",
        select: "name rollNumber email",
        populate: [
          {
            path: "classId",
            select: "className",
          },
          {
            path: "sectionId",
            select: "name",
          },
        ],
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
};

// 🔎 Get Certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id)
      .populate("issuedBy", "name email")
      .populate("sessionId", "yearRange")
      .populate({
        path: "studentId",
        select: "name rollNumber email",
        populate: [
          {
            path: "classId",
            select: "className",
          },
          {
            path: "sectionId",
            select: "name",
          },
        ],
      });
    if (!certificate) return res.status(404).json({ message: "Certificate not found" });
    res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificate", error: error.message });
  }
};

// ✏️ Update Certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;

    // Verify certificate belongs to school
    const existingCertificate = await Certificate.findById(id);
    if (!existingCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (schoolId && existingCertificate.schoolId.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "You can only update certificates for your school" });
    }

    // If studentId is being updated, verify it belongs to school
    if (req.body.studentId) {
      const student = await Student.findOne({
        _id: req.body.studentId,
        schoolId: existingCertificate.schoolId,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found or does not belong to this school" });
      }
    }

    const updated = await Certificate.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate("sessionId", "yearRange")
      .populate({
        path: "studentId",
        select: "name rollNumber email",
        populate: [
          {
            path: "classId",
            select: "className",
          },
          {
            path: "sectionId",
            select: "name",
          },
        ],
      });

    res.status(200).json({
      message: "Certificate updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating certificate", error: error.message });
  }
};

// ❌ Delete Certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Certificate not found" });
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting certificate", error: error.message });
  }
};

// 📋 Get Students by Class and Section for Certificate
exports.getStudentsByClassAndSection = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID not found in token" });
    }

    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    // Build query
    const query = { schoolId, classId };

    // If sectionId is provided, filter by sectionId
    if (sectionId) {
      query.sectionId = sectionId;
    }

    // Fetch students
    const students = await Student.find(query)
      .populate("sectionId", "name")
      .populate("classId", "className")
      .select("name rollNumber email sectionId classId")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// 🏠 Get House Options
exports.getHouseOptions = async (req, res) => {
  try {
    const houses = ["Red", "Green", "Blue", "Yellow"]; // Basic set; can be extended per school later
    res.status(200).json({ success: true, data: houses });
  } catch (error) {
    res.status(500).json({ message: "Error fetching houses", error: error.message });
  }
};
