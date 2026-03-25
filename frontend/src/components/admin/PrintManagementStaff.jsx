import AllStudentCard from './PrintDash/AllStudentCard';
import StaffCard from './PrintDash/StaffCard';
import TeacherCard from './PrintDash/TeacherCard';
// import StaffCard from './PrintDash/StaffCard'; 

const PrintManagement = () => {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center font-sans">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-screen-2xl">
        <div className="w-full flex justify-center">
          <StaffCard />
        </div>
        <div className="w-full flex justify-center">
          <TeacherCard />
        </div>
      </div>
    </div>
  )
}

export default PrintManagement
