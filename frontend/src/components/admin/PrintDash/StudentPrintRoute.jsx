import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PrintPreview from './PrintPreview';

const StudentPrintRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    items = [],
    title = 'Student ID Cards',
    type = 'student',
    sessionLabel = '',
    iCardType = 'I-Card 1',
  } = location.state || {};

  return (
    <PrintPreview
      title={title}
      items={items}
      type={type}
      sessionLabel={sessionLabel}
      iCardType={iCardType}
      onClose={() => navigate(-1)}
      displayMode="page"
      hideHeaderLogo={true}
    />
  );
};

export default StudentPrintRoute;
