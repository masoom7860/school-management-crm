const StudentDash = () => (
    <div className="flex gap-4 mb-4 h-fit">
      <div className="flex-1 bg-purple-100 p-6 rounded-xl text-center text-lg h-fit">
        <p className="font-semibold">Notification</p>
        <p>{dashboardData.notification}</p>
      </div>
      <div className="flex-1 bg-red-100 p-6 rounded-xl text-center text-lg h-fit">
        <p className="font-semibold">Events</p>
        <p>{dashboardData.events}</p>
      </div>
      <div className="flex-1 bg-yellow-100 p-6 rounded-xl text-center text-lg h-fit">
        <p className="font-semibold">Attendance</p>
        <p>{dashboardData.attendance}</p>
      </div>
    </div>
  );
    export default StudentDash; 