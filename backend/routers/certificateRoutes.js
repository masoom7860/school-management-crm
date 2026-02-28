const express = require("express");
const router = express.Router();
const {
  createCertificate,
  getCertificatesBySchool,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  getStudentsByClassAndSection,
  getHouseOptions,
} = require("../controllers/certificateController");
const { verifyAdminOrStaff, allowRoles } = require("../middlewares/authMiddleware");

router.get("/students", allowRoles("admin", "staff", "subadmin", "teacher"), getStudentsByClassAndSection);
router.get("/houses", allowRoles("admin", "staff", "subadmin", "teacher"), getHouseOptions);
router.post("/create", verifyAdminOrStaff, createCertificate);
router.get("/school/:schoolId", allowRoles("admin", "staff", "subadmin", "teacher"), getCertificatesBySchool);
router.get("/:id", allowRoles("admin", "staff", "subadmin", "teacher"), getCertificateById);
router.put("/update/:id", verifyAdminOrStaff, updateCertificate);
router.delete("/delete/:id", verifyAdminOrStaff, deleteCertificate);

module.exports = router;
