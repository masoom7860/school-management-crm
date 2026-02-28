import React from 'react';

const SuperAdminGuide = () => {
  return (
    <div className="doc-page">
      <h2>👑 Super Admin Guide</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          As a super admin, you manage the entire platform across multiple schools.
          You have control over school management, system configuration, and platform-wide settings.
        </p>
      </section>

      <section>
        <h3>🔐 Login</h3>
        <div className="guide-step">
          <h4>Step 1: Access Super Admin Login</h4>
          <p>Click on "Super Admin Login" from the home page</p>
        </div>

        <div className="guide-step">
          <h4>Step 2: Enter Credentials</h4>
          <p>
            <strong>Email:</strong> Your super admin email<br/>
            <strong>Password:</strong> Your account password
          </p>
        </div>

        <div className="guide-step">
          <h4>Step 3: Access Super Admin Dashboard</h4>
          <p>You will be redirected to the super admin dashboard</p>
        </div>
      </section>

      <section>
        <h3>🏢 Core Responsibilities</h3>
        
        <div className="feature-section">
          <h4>🏫 School Management</h4>
          <p>Manage multiple schools on the platform</p>
          <ul>
            <li>Add/Edit/Delete schools</li>
            <li>Assign school admins</li>
            <li>Monitor school activities</li>
            <li>Manage school subscriptions</li>
            <li>View school statistics</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>👔 Admin Management</h4>
          <p>Manage admins across all schools</p>
          <ul>
            <li>Create school admin accounts</li>
            <li>Assign schools to admins</li>
            <li>Monitor admin activities</li>
            <li>Manage admin permissions</li>
            <li>Reset admin passwords</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📊 Platform Analytics</h4>
          <p>View comprehensive platform-wide analytics</p>
          <ul>
            <li>Total schools registered</li>
            <li>Total students across platform</li>
            <li>Total staff members</li>
            <li>Revenue reports</li>
            <li>Usage statistics</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>💳 Subscription & Billing</h4>
          <p>Manage school subscriptions and billing</p>
          <ul>
            <li>View subscription plans</li>
            <li>Manage school subscriptions</li>
            <li>Track payments</li>
            <li>Generate invoices</li>
            <li>View billing history</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>🔧 System Configuration</h4>
          <p>Configure platform-wide settings</p>
          <ul>
            <li>System settings</li>
            <li>Email templates</li>
            <li>SMS configuration</li>
            <li>Feature toggles</li>
            <li>API keys management</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>👥 User Management</h4>
          <p>Manage users across all schools</p>
          <ul>
            <li>View all users</li>
            <li>Disable/Enable accounts</li>
            <li>Reset passwords</li>
            <li>Monitor user activity</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>📋 Reports & Compliance</h4>
          <p>Generate comprehensive reports</p>
          <ul>
            <li>School performance reports</li>
            <li>Revenue reports</li>
            <li>User activity logs</li>
            <li>System health reports</li>
            <li>Export data for compliance</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>🎯 Common Tasks</h3>
        
        <div className="task-item">
          <h4>How to Register a New School?</h4>
          <ol>
            <li>Go to "School Management"</li>
            <li>Click "Register New School"</li>
            <li>Fill in school details (name, address, contact)</li>
            <li>Set subscription plan</li>
            <li>Create admin account for the school</li>
            <li>Click "Register School"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Create School Admin?</h4>
          <ol>
            <li>Navigate to "Admin Management"</li>
            <li>Click "Create New Admin"</li>
            <li>Fill in admin details</li>
            <li>Select school(s) to assign</li>
            <li>Set admin permissions</li>
            <li>Click "Create Admin"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to View Platform Analytics?</h4>
          <ol>
            <li>Go to "Analytics Dashboard"</li>
            <li>View key metrics</li>
            <li>Select date range for detailed analysis</li>
            <li>Download reports if needed</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Manage School Subscription?</h4>
          <ol>
            <li>Go to "Subscription Management"</li>
            <li>Find the school</li>
            <li>View current subscription</li>
            <li>Upgrade/Downgrade plan</li>
            <li>Manage billing details</li>
            <li>Click "Save Changes"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to View Revenue Reports?</h4>
          <ol>
            <li>Navigate to "Reports"</li>
            <li>Select "Revenue Report"</li>
            <li>Choose date range and school (optional)</li>
            <li>Click "Generate Report"</li>
            <li>View or export the report</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Configure System Settings?</h4>
          <ol>
            <li>Go to "Settings"</li>
            <li>Select configuration section</li>
            <li>Update settings as needed</li>
            <li>Click "Save Configuration"</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>How to Reset Admin Password?</h4>
          <ol>
            <li>Go to "Admin Management"</li>
            <li>Find the admin account</li>
            <li>Click "Reset Password"</li>
            <li>Send temporary password to admin email</li>
            <li>Admin will set new password on next login</li>
          </ol>
        </div>
      </section>

      <section>
        <h3>📊 Dashboard Overview</h3>
        <p>The super admin dashboard shows:</p>
        <ul>
          <li>Total schools on platform</li>
          <li>Active users count</li>
          <li>Total revenue collected</li>
          <li>System status</li>
          <li>Recent activities across all schools</li>
          <li>Important alerts and notifications</li>
        </ul>
      </section>

      <section>
        <h3>🔐 Security & Compliance</h3>
        <div className="feature-section">
          <h4>User Activity Monitoring</h4>
          <p>Monitor all user activities for security</p>
        </div>

        <div className="feature-section">
          <h4>Data Backup</h4>
          <p>Regular data backups for all schools</p>
        </div>

        <div className="feature-section">
          <h4>Audit Logs</h4>
          <p>Access complete audit logs of system changes</p>
        </div>
      </section>

      <section>
        <h3>💡 Super Admin Best Practices</h3>
        <ul>
          <li>Monitor platform health regularly</li>
          <li>Review revenue reports monthly</li>
          <li>Keep school information updated</li>
          <li>Ensure all admins have appropriate access</li>
          <li>Backup critical data regularly</li>
          <li>Review user activity logs for security</li>
          <li>Update system configurations as needed</li>
          <li>Maintain compliance with data protection laws</li>
        </ul>
      </section>

      <section>
        <h3>❓ Troubleshooting</h3>
        <div className="troubleshooting">
          <h4>Can't register new school?</h4>
          <p>Ensure all required fields are filled and school name is unique</p>

          <h4>School admin can't login?</h4>
          <p>Reset the admin password or check if account is active</p>

          <h4>Reports not generating?</h4>
          <p>Verify the date range and selected filters are correct</p>
        </div>
      </section>

      <section>
        <h3>📞 Support</h3>
        <p>
          For platform-related issues or technical support, contact the development team.
          For school-specific issues, reach out to the school admin.
        </p>
      </section>
    </div>
  );
};

export default SuperAdminGuide;
