import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-gradient-to-r from-red-600 via-red-700 to-yellow-600 rounded-3xl overflow-hidden shadow-2xl relative"
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
                className="text-white"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ready to Transform Your School Management?
              </motion.h2>
              <motion.p 
                className="text-yellow-100 text-lg"
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
                    className="flex items-center gap-3 text-white"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <CheckCircle size={20} className="text-yellow-400 flex-shrink-0" />
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
                  className="bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-yellow-50 transition-colors flex items-center gap-2 shadow-xl"
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
                  className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.button>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 shadow-2xl"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/20">
                    <span className="text-white">Quick Stats</span>
                    <motion.span 
                      className="bg-yellow-400 text-red-700 px-3 py-1 rounded-full"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(251, 191, 36, 0.7)",
                          "0 0 0 10px rgba(251, 191, 36, 0)",
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
                    { label: 'Total Students', value: '1,245', width: '78%', color: 'from-yellow-400 to-yellow-500' },
                    { label: 'Attendance Today', value: '94%', width: '94%', color: 'from-red-400 to-red-500' },
                    { label: 'Fee Collection', value: '87%', width: '87%', color: 'from-yellow-400 to-yellow-500' }
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
                        <span className="text-yellow-100">{stat.label}</span>
                        <motion.span 
                          className="text-white"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                        >
                          {stat.value}
                        </motion.span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
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