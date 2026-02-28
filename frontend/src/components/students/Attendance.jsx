
const Attendance = () => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="font-semibold text-lg mb-4">Attendance</h2>
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full bg-gray-100 mb-4 flex items-center justify-center">
        <span className="text-sm text-gray-500">[Donut Chart]</span>
      </div>
      <div className="flex justify-between w-full mt-4">
        <div className="text-center">
          <div className="w-4 h-1 bg-red-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Absent</p>
          <p className="font-semibold text-sm">28.2%</p>
        </div>
        <div className="text-center">
          <div className="w-4 h-1 bg-orange-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Present</p>
          <p className="font-semibold text-sm">65.8%</p>
        </div>
      </div>
    </div>
  </div>
);

export default Attendance;
