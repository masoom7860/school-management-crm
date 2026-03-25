import { 
  Users, 
  GraduationCap, 
  Calendar, 
  FileText, 
  MessageSquare, 
  BarChart3,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Track student records, attendance, and academic performance all in one place.',
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: GraduationCap,
    title: 'Admission Portal',
    description: 'Streamline the admission process with online applications and automated workflows.',
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: Calendar,
    title: 'Timetable Management',
    description: 'Create and manage class schedules, exams, and events effortlessly.',
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-600 to-red-700'
  },
  {
    icon: FileText,
    title: 'Report Cards',
    description: 'Generate comprehensive report cards and progress reports automatically.',
    color: 'bg-red-100 text-red-700',
    gradient: 'from-red-600 to-red-700'
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Keep parents informed with instant notifications and messaging.',
    color: 'bg-red-100 text-red-700',
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Make data-driven decisions with powerful analytics and reporting tools.',
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: BookOpen,
    title: 'Library Management',
    description: 'Manage books, track issues and returns, and maintain digital records.',
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-600 to-red-700'
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Handle fee collection, invoicing, and financial reporting seamlessly.',
    color: 'bg-red-100 text-red-700',
    gradient: 'from-red-600 to-red-700'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-red-300/20 to-white rounded-full filter blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
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
          <motion.span 
            className="text-red-600 text-xl font-semibold "
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Features
          </motion.span>
          <h2 className="text-gray-900 mt-4 text-2xl font-semibold">
            Everything You Need to Run Your School
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Our comprehensive CRM solution provides all the tools you need to manage your educational institution efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 border-b-4 border-red-500 group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon size={28} className="text-white" />
                </motion.div>
                <h3 className="text-gray-900 mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}