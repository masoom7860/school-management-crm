import StudentCard from './PrintDash/StudentCard';
import AllStudentCard from './PrintDash/AllStudentCard';
// import StaffCard from './PrintDash/StaffCard'; 

const PrintManagement = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="w-full flex justify-center">
          <StudentCard />
        </div>
        <div className="w-full flex justify-center">
          <AllStudentCard />
        </div>
      </div>
    </div>
  )
}

export default PrintManagement
