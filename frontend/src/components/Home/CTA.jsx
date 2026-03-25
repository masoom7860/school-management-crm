import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-gradient-to-r from-white via-red-100 to-white rounded-3xl overflow-hidden shadow-2xl relative border border-red-200"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background shapes */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16 relative z-10">
            <div className="space-y-6">
              <motion.h2 
                className="text-gray-900"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ready to Transform Your School Management?
              </motion.h2>
              <motion.p 
                className="text-gray-700 text-lg"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Join hundreds of schools that have already modernized their operations with our comprehensive CRM solution.
              </motion.p>

              <ul className="space-y-3">
                {[
                  'Free 30-day trial, no credit card required',
                  '24/7 customer support',
                  'Easy migration from existing systems',
                  'Training and onboarding included'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-3 text-gray-900"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <CheckCircle size={20} className="text-red-600 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div 
                className="flex flex-wrap gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <motion.button 
                  className="bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 shadow-xl"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
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
                  className="border-2 border-red-600 text-red-700 px-8 py-4 rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.button>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <motion.div 
                className="bg-white rounded-2xl p-8 border-2 border-red-200 shadow-2xl"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-red-100">
                    <span className="text-gray-900">Quick Stats</span>
                    <motion.span 
                      className="bg-red-200 text-red-700 px-3 py-1 rounded-full"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(254, 202, 202, 0.9)",
                          "0 0 0 10px rgba(254, 202, 202, 0)",
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      Live
                    </motion.span>
                  </div>
                  
                  {[
                    { label: 'Total Students', value: '1,245', width: '78%', color: 'from-red-200 to-white' },
                    { label: 'Attendance Today', value: '94%', width: '94%', color: 'from-red-400 to-red-500' },
                    { label: 'Fee Collection', value: '87%', width: '87%', color: 'from-red-200 to-white' }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{stat.label}</span>
                        <motion.span 
                          className="text-gray-900"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                        >
                          {stat.value}
                        </motion.span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-3">
                        <motion.div 
                          className={`bg-gradient-to-r ${stat.color} h-3 rounded-full shadow-lg`}
                          initial={{ width: 0 }}
                          whileInView={{ width: stat.width }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA