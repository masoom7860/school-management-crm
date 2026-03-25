import { motion } from 'framer-motion';

const images = [
  {
    url: 'https://images.unsplash.com/photo-1516013474378-d6498f0d1434?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBzdHVkZW50cyUyMGhhcHB5fGVufDF8fHx8MTc2NDkxMjk3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Happy Students',
    category: 'Student Life'
  },
  {
    url: 'https://images.unsplash.com/photo-1764720573370-5008f1ccc9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlZHVjYXRpb24lMjBkaWdpdGFsfGVufDF8fHx8MTc2NTAxNjc5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Digital Learning',
    category: 'Technology'
  },
  {
    url: 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUwMTY3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Modern Classroom',
    category: 'Infrastructure'
  },
  {
    url: 'https://images.unsplash.com/photo-1654366698665-e6d611a9aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NDkyNzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Collaborative Learning',
    category: 'Education'
  }
];

export function Gallery() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-red-100 to-white relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-300/20 to-white rounded-full filter blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
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
          <span className="text-red-600 text-xl">Gallery</span>
          <h2 className="text-gray-900 mt-4 text-2xl font-semibold">
            See Our Platform in Action
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover how schools worldwide are transforming education with our CRM
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg h-80 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {image.category}
                  </motion.div>
                  <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                </motion.div>
              </motion.div>

              {/* Border Animation */}
              <motion.div 
                className="absolute inset-0 border-4 border-transparent rounded-2xl"
                whileHover={{ borderColor: "#ef4444" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Gallery