import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaUserGraduate,
  FaUsers,
  FaUserTie,
  FaUserCog,
  FaChartLine,
  FaChalkboardTeacher,
  FaBuilding
} from "react-icons/fa";
import { cardVariants, staggerContainer, floatingVariants } from "../../utils/animations";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EnhancedDashboardCard = () => {
  const [studentCount, setStudentCount] = useState(0);  
  const [teacherCount, setTeacherCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const schoolId = localStorage.getItem("schoolId");
        if (!schoolId) {
          console.error("No schoolId found in localStorage");
          return;
        }

        const token = localStorage.getItem("token");
        
        // Fetch all data in parallel
        const [studentRes, teacherRes, parentRes, staffRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/students/get/${schoolId}`, { headers: { Authorization: `Bearer ${token}` }}),
          axios.get(`${BASE_URL}/api/teachers/all/${schoolId}`, { headers: { Authorization: `Bearer ${token}` }}),
          axios.get(`${BASE_URL}/api/parents/getAllParent/${schoolId}`, { headers: { Authorization: `Bearer ${token}` }}),
          axios.get(`${BASE_URL}/api/staffs/getstaff/${schoolId}`, { headers: { Authorization: `Bearer ${token}` }})
        ]);

        // Process student data
        if (Array.isArray(studentRes.data)) {
          setStudentCount(studentRes.data.length);
        } else if (Array.isArray(studentRes.data.students)) {
          setStudentCount(studentRes.data.students.length);
        }

        // Process teacher data
        if (Array.isArray(teacherRes.data)) {
          setTeacherCount(teacherRes.data.length);
        } else if (Array.isArray(teacherRes.data.teachers)) {
          setTeacherCount(teacherRes.data.teachers.length);
        }

        // Process parent data
        if (Array.isArray(parentRes.data)) {
          setParentCount(parentRes.data.length);
        } else if (Array.isArray(parentRes.data.parents)) {
          setParentCount(parentRes.data.parents.length);
        }

        // Process staff data
        if (Array.isArray(staffRes.data)) {
          setStaffCount(staffRes.data.length);
        } else if (Array.isArray(staffRes.data.staff)) {
          setStaffCount(staffRes.data.staff.length);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Students",
      count: studentCount,
      icon: <FaUserGraduate className="text-blue-600 text-3xl" />,
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      subtitle: "Active learners",
      trend: "+12% from last month"
    },
    {
      title: "Teachers",
      count: teacherCount,
      icon: <FaChalkboardTeacher className="text-green-600 text-3xl" />,
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      subtitle: "Teaching staff",
      trend: "+5% from last month"
    },
    {
      title: "Parents",
      count: parentCount,
      icon: <FaUserTie className="text-yellow-600 text-3xl" />,
      bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      subtitle: "Parent accounts",
      trend: "+8% from last month"
    },
    {
      title: "Staff",
      count: staffCount,
      icon: <FaUserCog className="text-purple-600 text-3xl" />,
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      subtitle: "Support staff",
      trend: "+3% from last month"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 animate-pulse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
          variants={cardVariants}
          whileHover="hover"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }
          }}
        >
          {/* Floating decorative elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-24 h-24 bg-gray-100 rounded-full opacity-10"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute -bottom-8 -left-8 w-32 h-32 bg-gray-100 rounded-full opacity-5"
            variants={floatingVariants}
            animate={{ ...floatingVariants.animate, y: [10, -10, 10] }}
            transition={{ ...floatingVariants.animate.transition, delay: 0.5 }}
          />
          
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                <motion.p 
                  className="text-3xl font-bold text-gray-800 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {stat.count}
                </motion.p>
                <p className="text-gray-400 text-xs mt-1">{stat.subtitle}</p>
              </div>
              <motion.div
                className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.icon}
              </motion.div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                <FaChartLine className="text-xs" />
                {stat.trend}
              </span>
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default EnhancedDashboardCard;