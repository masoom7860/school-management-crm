import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaUsers,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardCard = () => {
  const [studentCount, setStudentCount] = useState(0);  
  const [teacherCount, setTeacherCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const schoolId = localStorage.getItem("schoolId");
        if (!schoolId) {
          console.error("No schoolId found in localStorage");
          return;
        }

        const token = localStorage.getItem("token");
        // Students
        const studentRes = await axios.get(`${BASE_URL}/api/students/get/${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` }});
        // console.log("Students Datas", studentRes.data);
        if (Array.isArray(studentRes.data)) {
          setStudentCount(studentRes.data.length);
        } else if (Array.isArray(studentRes.data.students)) {
          setStudentCount(studentRes.data.students.length);
        }

        // Teachers
        const teacherRes = await axios.get(`${BASE_URL}/api/teachers/all/${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` }});
        // console.log("Teacher Data", teacherRes.data);
        if (Array.isArray(teacherRes.data)) {
          setTeacherCount(teacherRes.data.length);
        } else if (Array.isArray(teacherRes.data.teachers)) {
          setTeacherCount(teacherRes.data.teachers.length);
        }

        // Parents
        const parentRes = await axios.get(`${BASE_URL}/api/parents/getAllParent/${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` }});
        // console.log("Parents Data", parentRes.data);
        if (Array.isArray(parentRes.data)) {
          setParentCount(parentRes.data.length);
        } else if (Array.isArray(parentRes.data.parents)) {
          setParentCount(parentRes.data.parents.length);
        }

        // Staff
        const staffRes = await axios.get(`${BASE_URL}/api/staffs/getstaff/${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` }});
        // console.log("StaffRes Data", staffRes.data);
        if (Array.isArray(staffRes.data)) {
          setStaffCount(staffRes.data.length);
        } else if (Array.isArray(staffRes.data.staff)) {
          setStaffCount(staffRes.data.staff.length);
        }



      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Students",
      count: studentCount,
      icon: <FaUserGraduate className="text-green-600 text-4xl" />,
      bgColor: "bg-green-200",
    },
    {
      title: "Teachers",
      count: teacherCount,
      icon: <FaUsers className="text-red-600 text-4xl" />,
      bgColor: "bg-red-200",
    },
    {
      title: "Parents",
      count: parentCount,
      icon: <FaUserTie className="text-yellow-600 text-4xl" />,
      bgColor: "bg-yellow-200",
    },
    {
      title: "Staff",
      count: staffCount,
      icon: <FaUserCog className="text-purple-600 text-4xl" />,
      bgColor: "bg-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4"
        >
          <div className={`p-5 rounded-full ${stat.bgColor}`}>
            {stat.icon}
          </div>
          <div>
            <h3 className="text-gray-600">{stat.title}</h3>
            <p className="text-xl font-semibold">{stat.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCard;