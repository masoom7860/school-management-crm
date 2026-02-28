import React from 'react';
import adminLoginImage from '../../../assets/School CRM/userlogin.png';
import schoolImagesImage from '../../../assets/School CRM/schoolimages.png';
import printManagementImage from '../../../assets/School CRM/Print marksheet.png';
import staffManagementImage from '../../../assets/School CRM/Staff management.png';
import teacherManagementImage from '../../../assets/School CRM/TeacherDashboard.png';
import studentManagementImage from '../../../assets/School CRM/Add Student.png';
import examManagementImage from '../../../assets/School CRM/Fill Marks.png';
import setMaximumMarksImage from '../../../assets/School CRM/Set Maximum Marks.png';
import designationManagementImage from '../../../assets/School CRM/Designation.png';
import sessionManagementImage from '../../../assets/School CRM/Session Management.png';
import classManagementImage from '../../../assets/School CRM/Class Management.png';
import subjectManagementImage from '../../../assets/School CRM/Subject Management.png';
import certificateManagementImage from '../../../assets/School CRM/Certificate Management.png';
import feeManagementImage from '../../../assets/School CRM/Student Fee Management.png';
import accountManagementImage from '../../../assets/School CRM/Existing Fee Structure.png';

const adminFeatureImages = {
  schoolImages: schoolImagesImage,
  printManagement: printManagementImage,
  staffManagement: staffManagementImage,
  teacherManagement: teacherManagementImage,
  studentManagement: studentManagementImage,
  examManagement: examManagementImage,
  setMaximumMarks: setMaximumMarksImage,
  designationManagement: designationManagementImage,
  sessionManagement: sessionManagementImage,
  classManagement: classManagementImage,
  subjectManagement: subjectManagementImage,
  certificateManagement: certificateManagementImage,
  feeManagement: feeManagementImage,
  accountManagement: accountManagementImage,
};

const AdminGuide = () => {
  return (
    <div className="doc-page">
      <h2>👔 Admin Guide</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          As a school admin, you have complete control over your school's operations. The admin dashboard provides comprehensive management tools for staff, students, academics, fees, exams, certifications, and more. This guide covers all the features available in your admin panel.
        </p>
      </section>

      <section>
        <h3>🔐 Login</h3>
        <div className="guide-step">
          <h4>Step 1: Access Admin Login</h4>
          <p>Click on "Admin Login" from the home page</p>
          <div className="screenshot-placeholder">
            <img
              src={adminLoginImage}
              alt="Admin Login Page"
              className="screenshot-image"
            />
          </div>
        </div>

        <div className="guide-step">
          <h4>Step 2: Enter Credentials</h4>
          <p>
            <strong>Email:</strong> Your admin email<br/>
            <strong>Password:</strong> Your account password
          </p>
        </div>

        <div className="guide-step">
          <h4>Step 3: Access Admin Dashboard</h4>
          <p>You will be redirected to the admin dashboard</p>
        </div>
      </section>

      <section>
        <h3>📊 Dashboard Sections & Features</h3>
        
        <div className="feature-section">
          <h4>🏫 School Images</h4>
          <p>Upload and manage school images for branding and documentation</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.schoolImages}
              alt="School Images dashboard view"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Upload school photos</li>
            <li>Manage image gallery</li>
            <li>Use for certificates and documents</li>
            <li>Organize images by category</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>🎓 Print Management</h4>
          <p>Generate and print ID cards and important documents</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.printManagement}
              alt="Print management dashboard"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li><strong>Student ID Cards</strong> - Print student identification documents</li>
            <li><strong>Staff ID Cards</strong> - Print staff/teacher identification documents</li>
            <li><strong>Print Marksheet</strong> - Generate and print student marksheets/report cards</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>👥 Staff Management</h4>
          <p>Manage all school staff members and their information</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.staffManagement}
              alt="Staff management screen"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Add new staff members</li>
            <li>Edit staff information</li>
            <li>Manage staff details (contact, address, qualifications)</li>
            <li>View staff directory</li>
            <li>Manage staff designations</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>👨‍🏫 Teacher Management</h4>
          <p>Manage teachers and assign them to classes/subjects</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.teacherManagement}
              alt="Teacher dashboard overview"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Add/Edit teacher information</li>
            <li>Assign teachers to classes</li>
            <li>Manage teacher subjects</li>
            <li>Track teacher qualifications</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>👨‍🎓 Student Management</h4>
          <p>Complete student lifecycle management</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.studentManagement}
              alt="Student management form"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li><strong>Add Student</strong> - Register new students with full details</li>
            <li><strong>Update Student</strong> - Edit existing student information</li>
            <li><strong>View All Students</strong> - Browse complete student directory</li>
            <li>Manage student classes and sections</li>
            <li>Track student status (active, inactive, transferred)</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📝 Exam Management</h4>
          <p>Manage examinations and marksheets</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.examManagement}
              alt="Fill marks screen"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li><strong>Fill Marksheet</strong> - Enter student marks for exams</li>
            <li>Set exam names and dates</li>
            <li>Configure exam details</li>
            <li>Manage multiple exams</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📊 Set Maximum Marks</h4>
          <p>Configure maximum marks for subjects and exams</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.setMaximumMarks}
              alt="Set maximum marks interface"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Set subject-wise maximum marks</li>
            <li>Configure exam-wise marks</li>
            <li>Manage grading scale</li>
            <li>Set passing marks</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>🏅 Designation Management</h4>
          <p>Manage staff designations and roles</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.designationManagement}
              alt="Designation management table"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Create new designations</li>
            <li>Edit designation details</li>
            <li>Assign designations to staff</li>
            <li>Manage designation hierarchy</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📅 Session Management</h4>
          <p>Configure academic sessions and terms</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.sessionManagement}
              alt="Session management dashboard"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Create new academic sessions</li>
            <li>Set session start and end dates</li>
            <li>Manage active session</li>
            <li>Track multiple sessions</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>🎓 Class Management</h4>
          <p>Create and manage classes/sections</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.classManagement}
              alt="Class management list"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Create new classes (e.g., Class 10-A)</li>
            <li>Assign class teachers</li>
            <li>Manage class strength</li>
            <li>Organize sections within classes</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📚 Subject Management</h4>
          <p>Manage subjects offered in school</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.subjectManagement}
              alt="Subject management grid"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Add new subjects</li>
            <li>Assign subjects to classes</li>
            <li>Manage subject codes</li>
            <li>Define subject curriculum</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>🎖️ Certificate Management</h4>
          <p>Generate and manage student certificates</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.certificateManagement}
              alt="Certificate management designer"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li>Create certificates for students</li>
            <li>Customize certificate templates</li>
            <li>Print certificates</li>
            <li>Store certificate records</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>💰 Fee Management</h4>
          <p>Complete fee management system</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.feeManagement}
              alt="Student fee management dashboard"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li><strong>Fee Structure Management</strong> - Define fee structure for classes/sections</li>
            <li><strong>Student Fee Management</strong> - Collect and track student fees</li>
            <li>Add fee heads (tuition, transport, etc.)</li>
            <li>Generate fee receipts</li>
            <li>Track fee payments and defaults</li>
            <li>View payment history</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>⚙️ Account Management</h4>
          <p>Manage your admin account</p>
          <div className="screenshot-placeholder">
            <img
              src={adminFeatureImages.accountManagement}
              alt="Account management settings"
              className="screenshot-image"
            />
          </div>
          <ul>
            <li><strong>Edit Account</strong> - Update your profile information</li>
            <li><strong>View Account</strong> - Review your account details</li>
            <li>Change password</li>
            <li>Update contact information</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>🎯 Common Tasks & Workflows</h3>
        
        <div className="task-item">
          <h4>How to Add a New Student?</h4>
          <ol>
            <li>Click "Student Management" → "Add Student" from sidebar</li>
            <li>Fill in student personal information (name, DOB, contact)</li>
            <li>Enter roll number and student ID</li>
            <li>Select class and section</li>
            <li>Add parent/guardian details (name, contact, email)</li>
            <li>Upload student photo (if required)</li>
            <li>Click "Save Student" button</li>
            <li>You'll receive confirmation of student registration</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Update Student Information?</h4>
          <ol>
            <li>Click "Student Management" → "Update Student" from sidebar</li>
            <li>Search for student by name, roll number, or ID</li>
            <li>Select student from search results</li>
            <li>Edit the information you want to change</li>
            <li>Update class/section if needed</li>
            <li>Click "Save Changes"</li>
            <li>Changes are reflected immediately</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Add Staff/Teacher?</h4>
          <ol>
            <li>Click "Staff Management" or "Teacher Management" from sidebar</li>
            <li>Click "Add New Staff/Teacher" button</li>
            <li>Enter personal information (name, contact, email, address)</li>
            <li>Select designation (for staff) or subject specialization (for teachers)</li>
            <li>Assign department/faculty</li>
            <li>Upload qualification documents if needed</li>
            <li>Click "Save Staff/Teacher"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Set Up Fee Structure?</h4>
          <ol>
            <li>Click "Fee Management" → "Fee Structure Management"</li>
            <li>Select class and section</li>
            <li>Click "Add Fee Structure"</li>
            <li>Add fee heads:
              <ul>
                <li>Tuition Fee</li>
                <li>Transport Fee</li>
                <li>Lab Fee</li>
                <li>Other charges</li>
              </ul>
            </li>
            <li>Enter amount for each head</li>
            <li>Set due date and payment terms</li>
            <li>Click "Save Fee Structure"</li>
            <li>This structure automatically applies to all students in that class</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Track Student Fee Payment?</h4>
          <ol>
            <li>Click "Fee Management" → "Student Fee Management"</li>
            <li>Search student by name or class</li>
            <li>View fee status (Paid/Pending)</li>
            <li>See payment history and dates</li>
            <li>Generate fee receipt if needed</li>
            <li>Send payment reminder if fee is pending</li>
            <li>Update payment status when received</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Create a Class?</h4>
          <ol>
            <li>Go to "Class Management" from sidebar</li>
            <li>Click "Create New Class"</li>
            <li>Enter class name (e.g., 10-A, 12-B)</li>
            <li>Select class teacher</li>
            <li>Set student strength limit</li>
            <li>Select section (if applicable)</li>
            <li>Click "Save Class"</li>
            <li>Class is now ready for student enrollment</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Add Subjects to Classes?</h4>
          <ol>
            <li>Go to "Subject Management"</li>
            <li>Click "Add Subject"</li>
            <li>Enter subject name and code</li>
            <li>Select class for this subject</li>
            <li>Assign subject teacher</li>
            <li>Set curriculum or description</li>
            <li>Click "Save Subject"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Fill Student Marksheet?</h4>
          <ol>
            <li>Go to "Exam Management" → "Fill Marksheet"</li>
            <li>Select exam name and date</li>
            <li>Select class and subject</li>
            <li>Enter marks for each student (out of maximum marks)</li>
            <li>Add comments/feedback (optional)</li>
            <li>Review marks for accuracy</li>
            <li>Click "Submit Marksheet"</li>
            <li>Marks are now visible to students and can be used for report cards</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Set Maximum Marks?</h4>
          <ol>
            <li>Go to "Set Maximum Marks"</li>
            <li>Select exam type (midterm, final, etc.)</li>
            <li>Select subjects or leave for all</li>
            <li>Set maximum marks (default is usually 100)</li>
            <li>Set passing marks threshold</li>
            <li>Apply grading scale if needed</li>
            <li>Click "Save Configuration"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Generate Student ID Cards?</h4>
          <ol>
            <li>Go to "Print" → "Student ID Card"</li>
            <li>Select class (optional, or leave for all)</li>
            <li>Choose template design</li>
            <li>Preview ID card layout</li>
            <li>Select students to generate cards for</li>
            <li>Click "Generate" button</li>
            <li>Click "Print" to print ID cards</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Generate Certificates?</h4>
          <ol>
            <li>Go to "Certificate Management"</li>
            <li>Click "Create New Certificate"</li>
            <li>Select certificate type (achievement, completion, etc.)</li>
            <li>Select students to award certificate</li>
            <li>Enter certificate details and date</li>
            <li>Choose template design</li>
            <li>Click "Generate Certificates"</li>
            <li>Print or save certificates as PDF</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Manage Academic Sessions?</h4>
          <ol>
            <li>Go to "Session Management"</li>
            <li>Click "Create New Session"</li>
            <li>Enter session name (e.g., 2024-2025)</li>
            <li>Set start date (typically June/July)</li>
            <li>Set end date (typically March/April)</li>
            <li>Mark as active if it's the current session</li>
            <li>Click "Save Session"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Upload School Images?</h4>
          <ol>
            <li>Go to "School Images" from sidebar</li>
            <li>Click "Upload Image"</li>
            <li>Select image from your computer</li>
            <li>Add title and description</li>
            <li>Categorize (building, events, etc.)</li>
            <li>Click "Upload"</li>
            <li>Images will be used in certificates and documents</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Print Marksheet/Report Card?</h4>
          <ol>
            <li>Go to "Print" → "Print Marksheet"</li>
            <li>Select exam</li>
            <li>Select class</li>
            <li>Choose student (or all students)</li>
            <li>Select report card format</li>
            <li>Preview marksheet</li>
            <li>Click "Print" to print report cards</li>
          </ol>
        </div>
      </section>

      <section>
        <h3>📊 Dashboard Overview</h3>
        <p>The main dashboard provides quick access to:</p>
        <ul>
          <li>Total students enrolled</li>
          <li>Total staff members</li>
          <li>Fee collection status</li>
          <li>Recent activities</li>
          <li>Quick statistics</li>
        </ul>
      </section>

      <section>
        <h3>🔧 System Configuration</h3>
        <div className="feature-section">
          <h4>Academic Calendar</h4>
          <p>Set school sessions, holidays, and important dates</p>
        </div>

        <div className="feature-section">
          <h4>Notifications</h4>
          <p>Configure automated notifications and alerts</p>
        </div>

        <div className="feature-section">
          <h4>Backup & Maintenance</h4>
          <p>Take data backups and perform system maintenance</p>
        </div>
      </section>

      <section>
        <h3>💡 Admin Best Practices & Tips</h3>
        <ul>
          <li><strong>Daily Tasks:</strong>
            <ul>
              <li>Check pending fee payments</li>
              <li>Monitor new admissions</li>
              <li>Review student/staff updates</li>
            </ul>
          </li>
          <li><strong>Weekly Tasks:</strong>
            <ul>
              <li>Review fee collection status</li>
              <li>Generate fee reports</li>
              <li>Monitor staff/teacher activities</li>
              <li>Check class-wise enrollment</li>
            </ul>
          </li>
          <li><strong>Monthly Tasks:</strong>
            <ul>
              <li>Generate comprehensive fee reports</li>
              <li>Review student performance data</li>
              <li>Update staff information if needed</li>
              <li>Plan upcoming exams</li>
              <li>Process payment reconciliation</li>
            </ul>
          </li>
          <li><strong>Academic Year Tasks:</strong>
            <ul>
              <li>Create new academic session</li>
              <li>Set up classes and sections</li>
              <li>Define fee structure for new session</li>
              <li>Plan examination schedule</li>
              <li>Conduct staff planning</li>
            </ul>
          </li>
          <li><strong>Data Management:</strong>
            <ul>
              <li>Keep student records updated</li>
              <li>Maintain accurate fee records</li>
              <li>Update staff qualifications regularly</li>
              <li>Backup important data periodically</li>
              <li>Archive old records appropriately</li>
            </ul>
          </li>
          <li><strong>Communication:</strong>
            <ul>
              <li>Send fee payment reminders to parents</li>
              <li>Communicate important announcements</li>
              <li>Notify parents of fee due dates</li>
              <li>Share reports with management if needed</li>
            </ul>
          </li>
          <li><strong>Compliance & Documentation:</strong>
            <ul>
              <li>Maintain proper fee receipts</li>
              <li>Keep student admission records</li>
              <li>Store staff documents safely</li>
              <li>Generate required reports for audits</li>
              <li>Ensure data privacy and security</li>
            </ul>
          </li>
          <li><strong>System Management:</strong>
            <ul>
              <li>Regularly update school information</li>
              <li>Upload school images for certificates</li>
              <li>Maintain accurate session records</li>
              <li>Keep designations updated</li>
              <li>Monitor system performance</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h3>❓ Troubleshooting & FAQ</h3>
        <div className="troubleshooting">
          <h4>Can't add student/staff?</h4>
          <p>Ensure all required fields (name, contact, class/section) are filled. Check for duplicate entries with same details. Verify that the class/section exists before assigning students.</p>

          <h4>Fee structure not showing for students?</h4>
          <p>Verify the fee structure is assigned to the correct class and section. Check that the academic session is active. Refresh your browser if recently created.</p>

          <h4>Can't upload student photo?</h4>
          <p>Check file format (JPG, PNG supported). Ensure file size is not too large (max 2MB). Verify you have sufficient storage space.</p>

          <h4>Marksheet marks not visible to students?</h4>
          <p>Confirm marksheet has been submitted (not just saved as draft). Check that exam date has been set correctly. Verify student is enrolled in that class for the exam.</p>

          <h4>Student ID Card not printing correctly?</h4>
          <p>Check printer settings and paper size. Verify student photo is uploaded. Try preview before printing. Ensure all student information is complete and accurate.</p>

          <h4>Fee payment not reflecting in system?</h4>
          <p>Confirm payment has been processed and verified. Check payment date matches database. Update student fee status manually if needed. Contact payment provider if issue persists.</p>

          <h4>Can't create new class?</h4>
          <p>Ensure class name is unique. Verify teacher is available. Check that academic session is active. Confirm no existing class with same name and section.</p>

          <h4>Exam/Subject not appearing in dropdown?</h4>
          <p>Create exam/subject first through respective management pages. Verify session is correct. Check if exam/subject is assigned to the class.</p>

          <h4>Staff/Teacher not showing up after adding?</h4>
          <p>Refresh page after adding. Verify designation is set correctly. Check if staff status is active (not inactive/deleted).</p>

          <h4>Report generation fails?</h4>
          <p>Check if date range is valid. Verify data exists for selected period. Try with smaller date range. Ensure sufficient browser memory for large reports.</p>

          <h4>Certificate template not applying correctly?</h4>
          <p>Verify school image is uploaded properly. Check template is selected before generating. Ensure certificate details are filled correctly. Try different template if one fails.</p>

          <h4>Can't modify fee after students enrolled?</h4>
          <p>This is typically locked to prevent data inconsistency. Create new fee structure for new session. Contact support if structure needs urgent change.</p>

          <h4>Session dates showing incorrectly?</h4>
          <p>Verify your system date/time is correct. Check session start/end dates. Edit session if dates need correction.</p>

          <h4>Import/Export not working?</h4>
          <p>Ensure file format is correct (CSV/XLSX). Check column headers match requirements. Verify no special characters in data.</p>
        </div>
      </section>
    </div>
  );
};

export default AdminGuide;
