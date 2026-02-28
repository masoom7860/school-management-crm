
const Overview = () => {
  return (
    <div className="doc-page">
      <h2>Welcome to School Management System (Zosto)</h2>
      
      <section>
        <h3>🎯 What is Zosto?</h3>
        <p>
          Zosto is a comprehensive school management system designed to streamline administrative tasks,
          enhance communication, and improve the overall management of educational institutions. It provides
          different dashboards for students, teachers, parents, admins, and super admins.
        </p>
      </section>

      <section>
        <h3>👥 System Roles</h3>
        <div className="role-cards">
          <div className="role-card">
            <h4>👨‍🎓 Student</h4>
            <p>View grades, attendance, assignments, and communicate with teachers</p>
          </div>
          <div className="role-card">
            <h4>👨‍🏫 Teacher</h4>
            <p>Manage classes, mark attendance, upload grades, and create assignments</p>
          </div>
          <div className="role-card">
            <h4>👨‍👩‍👧 Parent</h4>
            <p>Monitor child's performance, attendance, and communicate with teachers</p>
          </div>
          <div className="role-card">
            <h4>👔 Admin</h4>
            <p>Manage school operations, staff, fees, reports, and general administration</p>
          </div>
          <div className="role-card">
            <h4>👑 Super Admin</h4>
            <p>Manage multiple schools, system configurations, and overall platform</p>
          </div>
        </div>
      </section>

      <section>
        <h3>🚀 Getting Started</h3>
        <ol>
          <li>Click on the appropriate login option (Student/Teacher/Parent/Admin/Super Admin)</li>
          <li>Enter your credentials</li>
          <li>You will be redirected to your personalized dashboard</li>
          <li>Use the sidebar menu to navigate different sections</li>
        </ol>
      </section>

      <section>
        <h3>📚 Documentation Sections</h3>
        <p>Select a guide from the left sidebar to learn how to use each role's features:</p>
        <ul>
          <li><strong>Student Guide:</strong> Learn how to view your grades, attendance, and assignments</li>
          <li><strong>Teacher Guide:</strong> Manage classes, mark attendance, and upload grades</li>
          <li><strong>Admin Guide:</strong> Manage school operations and administrative tasks</li>
          <li><strong>Super Admin Guide:</strong> Control multiple schools and system settings</li>
        </ul>
      </section>

      <section>
        <h3>❓ Need Help?</h3>
        <p>
          Each section contains detailed guides with step-by-step instructions and screenshots to help you navigate the system.
          If you still need assistance, contact your school administrator.
        </p>
      </section>

      <section className="quick-tips">
        <h3>💡 Quick Tips</h3>
        <ul>
          <li>Use the sidebar menu to navigate between different sections</li>
          <li>Click on buttons/cards to perform actions</li>
          <li>Look for the help icons (?) for additional information</li>
          <li>Use search functionality to find specific information quickly</li>
        </ul>
      </section>
    </div>
  );
};

export default Overview;
