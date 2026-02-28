import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    {
      id: 'overview',
      label: '🏠 Overview',
      icon: '📖',
    },
    {
      id: 'registration',
      label: '🏫 School Registration',
      icon: '📝',
    },
    {
      id: 'student',
      label: '👨‍🎓 Student Guide',
      icon: '📚',
    },
    {
      id: 'teacher',
      label: '👨‍🏫 Teacher Guide',
      icon: '🎓',
    },
    {
      id: 'admin',
      label: '👔 Admin Guide',
      icon: '⚙️',
    },
    {
      id: 'superadmin',
      label: '👑 Super Admin Guide',
      icon: '🔐',
    },
  ];

  return (
    <aside className="doc-sidebar">
      <div className="sidebar-content">
        <h3>Guide Topics</h3>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="icon">{section.icon}</span>
              <span className="label">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
