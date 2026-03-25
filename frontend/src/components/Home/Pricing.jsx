import { Check, Star } from 'lucide-react';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    description: 'Perfect for small schools',
    popular: false,
    features: [
      'Up to 200 students',
      'Basic student management',
      'Attendance tracking',
      'Parent communication',
      'Report card generation',
      'Email support',
      'Mobile app access',
      '5GB storage'
    ],
    color: 'border-gray-200',
    buttonClass: 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
  },
  {
    name: 'Professional',
    price: '₹9,999',
    period: '/month',
    description: 'Most popular choice',
    popular: true,
    features: [
      'Up to 500 students',
      'Advanced student management',
      'Attendance & biometric integration',
      'Parent portal & app',
      'Online fee payment',
      'Priority support',
      'Custom reports',
      '20GB storage',
      'SMS notifications',
      'Library management'
    ],
    color: 'border-red-300 shadow-2xl lg:scale-105',
    buttonClass: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-xl'
  },
  {
    name: 'Enterprise',
    price: '₹19,999',
    period: '/month',
    description: 'For large institutions',
    popular: false,
    features: [
      'Unlimited students',
      'Full feature access',
      'Multi-campus support',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Advanced analytics',
      'Unlimited storage',
      'White-label option',
      'Custom development',
      'On-premise deployment'
    ],
    color: 'border-gray-200',
    buttonClass: 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-white via-red-100 to-white relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-300/20 to-white rounded-full filter blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-red-600 uppercase tracking-wide sm:text-base text-xl">Pricing</span>
          <h2 className="text-gray-900 mt-2 sm:mt-4 text-2xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Choose the perfect plan for your institution. All plans include a 30-day free trial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-white rounded-2xl p-6 sm:p-8 border-2 ${plan.color} relative hover:shadow-2xl transition-all duration-300 h-full flex flex-col min-w-0`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: plan.popular ? 1.08 : 1.03 }}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-5 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-red-200 to-red-300 text-red-700 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 10px 20px rgba(239, 68, 68, 0.25)",
                        "0 10px 30px rgba(239, 68, 68, 0.35)",
                        "0 10px 20px rgba(239, 68, 68, 0.25)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star size={16} className="fill-current" />
                    <span>Most Popular</span>
                  </motion.div>
                </motion.div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-gray-900 mb-2 text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <motion.span 
                    className="text-gray-900 text-3xl sm:text-4xl font-bold"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {plan.price}
                  </motion.span>
                  <span className="text-gray-600 mb-1 text-sm sm:text-base">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <motion.li 
                    key={fIndex} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + fIndex * 0.05 }}
                  >
                    <Check size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button 
                className={`w-full py-3 sm:py-4 rounded-lg transition-all duration-300 ${plan.buttonClass} mt-auto`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-4 border-red-200"
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <motion.div 
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <BsFillPatchCheckFill className="text-white" size={20} />
              </motion.div>
              <div className="text-left">
                <div className="text-gray-900 text-sm sm:text-base">30-Day Money Back Guarantee</div>
                <div className="text-gray-600 text-xs sm:text-sm">Try risk-free. Not satisfied? Get a full refund.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
export default Pricing