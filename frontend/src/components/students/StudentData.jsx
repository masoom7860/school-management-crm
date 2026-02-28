import StudentProfile from './StudentProfile';
import StudentStats from './StudentStats';
import ExamResults from './ExamResults';
import AttendanceChart from './AttendanceChart';
import StudentEventCalendar from './StudentEventCalendar';
import DashboardNotifications from './DashboardNotifications';
// import Notification from './Notification';

export default function StudentData() {
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12">
          <StudentProfile />
        </div>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1">
            <StudentStats />
          </div>
          <div className="flex-[2]">
            <ExamResults />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <AttendanceChart />
        <StudentEventCalendar />
        <DashboardNotifications />
        
      </div>
      <p className='mt-10'>
      © Copyrights akkhor 2019. All rights reserved. Designed by PsdBosS 
      </p>
    </div>
  );
}
