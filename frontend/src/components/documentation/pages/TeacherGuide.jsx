import React from 'react';
import teacherLoginImage from '../../../assets/School CRM/userlogin.png';

const TeacherGuide = () => {
  return (
    <div className="doc-page">
      <h2>👨‍🏫 Teacher Guide</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          As a teacher, you can manage your classes, mark attendance, upload grades,
          create assignments, and communicate with students and parents.
        </p>
      </section>

      <section>
        <h3>🔐 Login</h3>
        <div className="guide-step">
          <h4>Step 1: Access Teacher Login</h4>
          <p>Click on "User Login" from the home page</p>
        </div>

        <div className="guide-step">
          <h4>Step 2: Enter Credentials</h4>
          <p>
            <strong>Username/Email:</strong> Your teacher email<br/>
            <strong>Password:</strong> Your account password
          </p>
        </div>

        <div className="guide-step">
          <h4>Step 3: Access Teacher Dashboard</h4>
          <p>You will be redirected to your teacher dashboard</p>
          <div className="screenshot-placeholder">
            <img
              src={teacherLoginImage}
              alt="Teacher Dashboard Login"
              className="screenshot-image"
            />
          </div>
        </div>
      </section>

      <section>
        <h3>📊 Dashboard Features</h3>
        
        <div className="feature-section">
          <h4>📚 Class Management</h4>
          <p>Manage your assigned classes and students</p>
          <ul>
            <li>View all your classes</li>
            <li>View student list for each class</li>
            <li>View class schedule</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>✅ Mark Attendance</h4>
          <p>Mark student attendance for each class</p>
          <ul>
            <li>Select class and date</li>
            <li>Mark present/absent for each student</li>
            <li>Save attendance records</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📝 Upload Grades</h4>
          <p>Upload exam results and grades for students</p>
          <ul>
            <li>Select exam/assignment</li>
            <li>Enter marks for each student</li>
            <li>Add feedback/comments</li>
            <li>Submit grades</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📋 Assignments</h4>
          <p>Create and manage assignments for your classes</p>
          <ul>
            <li>Create new assignment</li>
            <li>Set deadline</li>
            <li>Upload assignment files</li>
            <li>View submissions</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📚 Study Materials</h4>
          <p>Upload study materials for students</p>
          <ul>
            <li>Upload PDFs, documents, videos</li>
            <li>Organize by topic/chapter</li>
            <li>Make materials available to students</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>💬 Communication</h4>
          <p>Communicate with students and parents</p>
          <ul>
            <li>Send notifications to class</li>
            <li>Message individual students</li>
            <li>Reply to parent inquiries</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>🎯 Common Tasks</h3>
        
        <div className="task-item">
          <h4>How to Mark Attendance?</h4>
          <ol>
            <li>Go to "Attendance" section</li>
            <li>Select your class and date</li>
            <li>Mark present/absent for each student</li>
            <li>Click "Save Attendance"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Upload Grades?</h4>
          <ol>
            <li>Navigate to "Grades/Results"</li>
            <li>Select exam/assignment type</li>
            <li>Enter marks for each student</li>
            <li>Add feedback/comments (optional)</li>
            <li>Click "Submit Grades"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Create an Assignment?</h4>
          <ol>
            <li>Go to "Assignments" section</li>
            <li>Click "Create New Assignment"</li>
            <li>Enter assignment title and description</li>
            <li>Set deadline date</li>
            <li>Upload assignment file/attachment</li>
            <li>Select classes</li>
            <li>Click "Publish Assignment"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Upload Study Materials?</h4>
          <ol>
            <li>Navigate to "Study Materials"</li>
            <li>Click "Upload Material"</li>
            <li>Select subject/topic</li>
            <li>Upload file or link</li>
            <li>Select classes who can access</li>
            <li>Click "Upload"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Send Notification?</h4>
          <ol>
            <li>Go to "Notifications" or "Messages"</li>
            <li>Click "Send Notification"</li>
            <li>Select class or individual students</li>
            <li>Type your message</li>
            <li>Click "Send"</li>
          </ol>
        </div>
      </section>

      <section>
        <h3>📊 Reports & Analytics</h3>
        <ul>
          <li>View class attendance report</li>
          <li>View student grade distribution</li>
          <li>Analyze class performance</li>
          <li>Generate printable reports</li>
        </ul>
      </section>

      <section>
        <h3>💡 Best Practices</h3>
        <ul>
          <li>Mark attendance promptly after each class</li>
          <li>Upload grades within the specified timeframe</li>
          <li>Provide constructive feedback along with grades</li>
          <li>Give adequate time for assignment deadlines</li>
          <li>Communicate regularly with students and parents</li>
          <li>Keep study materials organized and up-to-date</li>
        </ul>
      </section>

      <section>
        <h3>❓ Troubleshooting</h3>
        <div className="troubleshooting">
          <h4>Can't upload grades?</h4>
          <p>Ensure you have selected the correct exam and all required fields are filled</p>

          <h4>Students not seeing my materials?</h4>
          <p>Check that you have selected the correct classes when uploading materials</p>

          <h4>Attendance not saving?</h4>
          <p>Verify all students are marked and try saving again or contact admin</p>
        </div>
      </section>
    </div>
  );
};

export default TeacherGuide;
