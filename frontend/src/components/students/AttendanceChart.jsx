
export default function AttendanceChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Attendance</h2>
      <div className="flex justify-center">
        <div className="w-40 h-40 bg-[conic-gradient(#f59e0b_65%,#3b82f6_0)] rounded-full relative">
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      <div className="mt-6 flex justify-around text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-500 font-semibold">
            <div className="w-3 h-1 bg-red-500 rounded-full" /> Absent
          </div>
          <p className="font-bold">28.2%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 font-semibold">
            <div className="w-3 h-1 bg-yellow-500 rounded-full" /> Present
          </div>
          <p className="font-bold">65.8%</p>
        </div>
      </div>
    </div>
  );
}
