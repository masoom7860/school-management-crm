import { useState } from 'react';
import './Documentation.css';
import Sidebar from './Sidebar';
import Overview from './pages/Overview';
import StudentGuide from './pages/StudentGuide';
import TeacherGuide from './pages/TeacherGuide';
import AdminGuide from './pages/AdminGuide';
import SuperAdminGuide from './pages/SuperAdminGuide';
import SchoolRegistrationGuide from './pages/SchoolRegistrationGuide';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'student':
        return <StudentGuide />;
      case 'teacher':
        return <TeacherGuide />;
      case 'admin':
        return <AdminGuide />;
      case 'superadmin':
        return <SuperAdminGuide />;
      case 'registration':
        return <SchoolRegistrationGuide />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="documentation-container">
      <div className="doc-header">
        <h1>📚 Documentation & Help Center</h1>
        <p>Complete guide to using School Management System (Zosto)</p>
      </div>
      
      <div className="doc-content">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="doc-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
