import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import { cardVariants, chartVariants } from '../../utils/animations';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const AnimatedDashboardCharts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    studentData: [],
    teacherData: [],
    parentData: [],
    attendanceData: [],
    performanceData: []
  });

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setChartData({
        studentData: [
          { name: 'Class 1', students: 45 },
          { name: 'Class 2', students: 38 },
          { name: 'Class 3', students: 42 },
          { name: 'Class 4', students: 35 },
          { name: 'Class 5', students: 48 },
          { name: 'Class 6', students: 41 }
        ],
        teacherData: [
          { subject: 'Math', teachers: 8 },
          { subject: 'Science', teachers: 6 },
          { subject: 'English', teachers: 7 },
          { subject: 'History', teachers: 4 },
          { subject: 'Art', teachers: 3 }
        ],
        parentData: [
          { name: 'Jan', parents: 120 },
          { name: 'Feb', parents: 135 },
          { name: 'Mar', parents: 142 },
          { name: 'Apr', parents: 158 },
          { name: 'May', parents: 165 },
          { name: 'Jun', parents: 178 }
        ],
        attendanceData: [
          { day: 'Mon', attendance: 85 },
          { day: 'Tue', attendance: 92 },
          { day: 'Wed', attendance: 78 },
          { day: 'Thu', attendance: 88 },
          { day: 'Fri', attendance: 95 }
        ],
        performanceData: [
          { month: 'Jan', score: 75 },
          { month: 'Feb', score: 82 },
          { month: 'Mar', score: 78 },
          { month: 'Apr', score: 85 },
          { month: 'May', score: 88 },
          { month: 'Jun', score: 92 }
        ]
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </motion.div>
      ))}
    </div>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
    >
      {/* Student Distribution Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaChartBar className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Student Distribution</h3>
            <p className="text-sm text-gray-500">By Class</p>
          </div>
        </div>
        
        <motion.div
          className="h-64"
          initial="hidden"
          animate="visible"
          variants={chartVariants}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.studentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar 
                dataKey="students" 
                fill="url(#colorStudents)" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.studentData.map((entry, index) => (
                  <motion.rect
                    key={`bar-${index}`}
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Teacher Subject Distribution */}
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <FaChartPie className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Teachers by Subject</h3>
            <p className="text-sm text-gray-500">Distribution</p>
          </div>
        </div>
        
        <motion.div
          className="h-64"
          initial="hidden"
          animate="visible"
          variants={chartVariants}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.teacherData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="teachers"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.teacherData.map((entry, index) => (
                  <motion.g
                    key={`cell-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  </motion.g>
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Performance Trend Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FaChartLine className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Performance Trend</h3>
            <p className="text-sm text-gray-500">Monthly Progress</p>
          </div>
        </div>
        
        <motion.div
          className="h-64"
          initial="hidden"
          animate="visible"
          variants={chartVariants}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#8B5CF6"
                fill="url(#colorPerformance)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedDashboardCharts;