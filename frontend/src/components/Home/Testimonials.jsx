import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Principal, Delhi Public School',
    image: 'https://images.unsplash.com/photo-1722299547714-697e1c92ed41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBlZHVjYXRpb24lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2NTAxNjQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'School CRM has transformed how we manage our institution. The automation features have saved us countless hours and improved our efficiency tremendously.',
    rating: 5
  },
  {
    name: 'Rajesh Kumar',
    role: 'Administrator, St. Xavier\'s Academy',
    image: 'https://images.unsplash.com/photo-1758522275144-85aa16c4ae28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwc3R1ZGVudCUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1MDE2NDY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'The parent communication feature is a game-changer. Parents love being able to track their child\'s progress in real-time, and it has significantly improved our engagement.',
    rating: 5
  },
  {
    name: 'Meera Patel',
    role: 'Director, Bright Future School',
    image: 'https://images.unsplash.com/photo-1654366698665-e6d611a9aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NDkyNzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'Outstanding platform with excellent support. The analytics features help us make informed decisions about our school\'s future. Highly recommended!',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-300/20 to-red-300/20 rounded-full filter blur-3xl"
        animate={{
          y: [0, 50, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
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
          <span className="text-red-600">Testimonials</span>
          <h2 className="text-gray-900 mt-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 mt-4">
            Hear from school leaders who have transformed their institutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-red-500 relative"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            >
              {/* Quote Icon */}
              <motion.div 
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                whileHover={{ rotate: 360 }}
              >
                <span className="text-red-700 text-2xl">"</span>
              </motion.div>

              <motion.div 
                className="flex gap-1 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.4 + i * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                  >
                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
              
              <p className="text-gray-700 mb-6">
                {testimonial.content}
              </p>

              <div className="flex items-center gap-4">
                <motion.img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <div>
                  <div className="text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials