import { UserPlus, Settings, Rocket, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: UserPlus,
    step: 'Step 1',
    title: 'Sign Up & Setup',
    description: 'Create your account in minutes and customize your school profile with our easy setup wizard.',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Settings,
    step: 'Step 2',
    title: 'Configure System',
    description: 'Add classes, subjects, staff members, and students. Import existing data or start fresh.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Rocket,
    step: 'Step 3',
    title: 'Go Live',
    description: 'Launch your school management system and invite teachers, students, and parents to join.',
    color: 'from-red-600 to-red-700'
  },
  {
    icon: TrendingUp,
    step: 'Step 4',
    title: 'Grow & Scale',
    description: 'Track performance, analyze data, and continuously improve your institution with our insights.',
    color: 'from-yellow-600 to-yellow-700'
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-red-100 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 1px, transparent 1px, transparent 20px)',
        }}></div>
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-300/20 to-white rounded-full filter blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-red-600 text-xl">Process</span>
          <h2 className="text-gray-900 mt-4 text-2xl font-semibold">
            How It Works
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Get started in 4 simple steps and transform your school management
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines */}
          <motion.div 
            className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-red-200 via-white to-red-200"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={index} 
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <motion.div 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-red-500"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  {/* Step Number Badge */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                    whileHover={{ rotate: 360 }}
                  >
                    <span className="text-red-700">{index + 1}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon size={32} className="text-white" />
                  </motion.div>

                  <div className="text-red-600 mb-2">{item.step}</div>
                  <h3 className="text-gray-900 mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default HowItWorks