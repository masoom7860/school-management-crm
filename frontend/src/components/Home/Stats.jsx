import { motion } from 'framer-motion';

export function Stats() {
  const stats = [
    { value: '500+', label: 'Schools Trust Us' },
    { value: '50,000+', label: 'Active Students' },
    { value: '5,000+', label: 'Teachers' },
    { value: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-600 via-red-700 to-yellow-600 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <motion.div 
        className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-400/10 rounded-full"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white">
            Trusted by Educational Institutions Worldwide
          </h2>
          <p className="text-yellow-100 mt-4">
            Join thousands of schools already using our platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                y: -10
              }}
            >
              <motion.div 
                className="text-white mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-yellow-200">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}