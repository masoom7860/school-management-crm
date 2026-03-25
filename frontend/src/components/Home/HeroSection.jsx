import { motion } from 'framer-motion';
import ArrowRight from '../icons/ArrowRight';
import { useState } from 'react';
import ContactSchoolModal from '../common/ContactSchoolModal';
import { BsCheckLg } from 'react-icons/bs';
const Play = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="relative bg-gradient-to-br from-white via-red-100 to-white overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-400/30 to-white rounded-full filter blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-white to-red-400/30 rounded-full filter blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div 
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="bg-red-100 text-red-700 px-4 py-2 rounded-full shadow-lg inline-block"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0 10px 20px rgba(239, 68, 68, 0.2)",
                    "0 10px 30px rgba(239, 68, 68, 0.35)",
                    "0 10px 20px rgba(239, 68, 68, 0.2)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                #1 School Management Solution
              </motion.span>
            </motion.div>
            
            <motion.h1 
              className="text-gray-900 text-2xl font-bold"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Manage Your School Efficiently with Modern CRM
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Streamline admissions, track student progress, manage staff, and communicate with parents - all in one powerful platform designed for modern educational institutions.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button 
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
              >
                Start Free Trial
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
              <motion.button 
                className="bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors border-2 border-red-600 flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
              >
                <Play size={20} />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { value: '500+', label: 'Schools', color: 'text-red-600' },
                { value: '50K+', label: 'Students', color: 'text-red-600' },
                { value: '98%', label: 'Satisfaction', color: 'text-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <motion.div 
                    className={stat.color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-red-300"
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src="https://images.unsplash.com/photo-1654366698665-e6d611a9aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NDkyNzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Students in classroom"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Floating Card */}
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-2xl border-l-4 border-red-600"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <BsCheckLg className="text-red-600" size={20} />
                </motion.div>
                <div>
                  <div className="text-gray-900">Easy to Use</div>
                  <div className="text-gray-500">Intuitive Interface</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <ContactSchoolModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
