import studentLoginImage from '../../../assets/School CRM/userlogin.png';
import studentDashboardImage from '../../../assets/School CRM/StudentDashboard.png';

const StudentGuide = () => {
  return (
    <div className="doc-page">
      <h2>👨‍🎓 Student Guide</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          As a student, you can access your academic information, view your grades, check attendance,
          and communicate with your teachers through the student dashboard.
        </p>
      </section>

      <section>
        <h3>🔐 Login</h3>
        <div className="guide-step">
          <h4>Step 1: Access the Login Page</h4>
          <p>Click on "User Login" from the home page</p>
          <div className="screenshot-placeholder">
            <img
              src={studentLoginImage}
              alt="Student Login Page"
              className="screenshot-image"
            />
          </div>
        </div>

        <div className="guide-step">
          <h4>Step 2: Enter Your Credentials</h4>
          <p>
            <strong>Username/Email:</strong> Your email or student ID<br/>
            <strong>Password:</strong> Your account password
          </p>
        </div>

        <div className="guide-step">
          <h4>Step 3: Click Login</h4>
          <p>You will be redirected to your student dashboard</p>
        </div>
      </section>

      <section>
        <h3>📊 Dashboard Features</h3>
        <div className="screenshot-placeholder">
          <img
            src={studentDashboardImage}
            alt="Student dashboard overview"
            className="screenshot-image"
          />
        </div>
        
        <div className="feature-section">
          <h4>📈 Academic Performance</h4>
          <p>View your grades for different subjects and exams</p>
          <ul>
            <li>Check subject-wise performance</li>
            <li>View exam results</li>
            <li>Track overall GPA</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>✅ Attendance</h4>
          <p>Monitor your attendance record</p>
          <ul>
            <li>View daily attendance status</li>
            <li>Check monthly attendance percentage</li>
            <li>See absent and present days</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📝 Assignments & Study Materials</h4>
          <p>Access assignments and study materials uploaded by teachers</p>
          <ul>
            <li>Download assignment files</li>
            <li>View assignment deadlines</li>
            <li>Access study materials</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>💬 Communication</h4>
          <p>Communicate with teachers and receive notifications</p>
          <ul>
            <li>View notifications from teachers</li>
            <li>Send messages to teachers</li>
            <li>Receive announcements</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📋 Fee Information</h4>
          <p>Check your fee status and payment information</p>
          <ul>
            <li>View fee structure</li>
            <li>Check payment history</li>
            <li>Download fee receipts</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>🎯 Common Tasks</h3>
        
        <div className="task-item">
          <h4>How to View Your Grades?</h4>
          <ol>
            <li>Click on "Academics" or "Grades" in the sidebar</li>
            <li>Select the subject or exam</li>
            <li>View your score and feedback</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Download Study Materials?</h4>
          <ol>
            <li>Go to "Study Materials" section</li>
            <li>Select the subject or topic</li>
            <li>Click the download button</li>
            <li>File will be saved to your downloads folder</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Check Attendance?</h4>
          <ol>
            <li>Navigate to "Attendance" section</li>
            <li>View your attendance record</li>
            <li>Check percentage and status</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Update Profile?</h4>
          <ol>
            <li>Click on "Profile" or your name in the top-right corner</li>
            <li>Click "Edit Profile"</li>
            <li>Update your information</li>
            <li>Click "Save Changes"</li>
          </ol>
        </div>
      </section>

      <section>
        <h3>💡 Tips for Students</h3>
        <ul>
          <li>Check the dashboard regularly to stay updated with grades and assignments</li>
          <li>Download study materials before the deadline</li>
          <li>Keep track of attendance percentage to avoid missing classes</li>
          <li>Reach out to teachers for clarification on assignments</li>
          <li>Update your profile with accurate contact information</li>
        </ul>
      </section>

      <section>
        <h3>❓ Troubleshooting</h3>
        <div className="troubleshooting">
          <h4>Can't login?</h4>
          <p>Reset your password or contact your school administrator</p>

          <h4>Can't see my grades?</h4>
          <p>Grades are uploaded by teachers. Check with your teacher if grades are pending.</p>

          <h4>Attendance shows wrong?</h4>
          <p>Contact your class teacher or admin to verify attendance records</p>
        </div>
      </section>
    </div>
  );
};

export default StudentGuide;
