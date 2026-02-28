import React from 'react'
import StudentsChart from './dashboardcharts/StudentChart.jsx';
import TeacherChart from './dashboardcharts/TeacherChart.jsx';
import ParentChart from './dashboardcharts/ParentChart.jsx';

function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StudentsChart />
      <TeacherChart />
      <ParentChart />
      {/* <StaffChart /> */}
    </div>
  );
}

export default DashboardCharts
