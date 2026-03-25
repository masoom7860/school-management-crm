import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn, slideInUp } from '../utils/animations';
import Hero1 from '../assets/Hero1.jpg'
import Hero2 from '../assets/Hero2.jpg'
import Hero3 from '../assets/Hero3.jpg'
// import { Link } from 'react-router-dom';
import RegistrationForm from "../components/RegistrationForm"; // Import your registration component
import HeroSection from "../components/Home/HeroSection";
// import Features from "../components/Home/Features";
import FeaturesSection from "../components/Home/FeaturesSection";
import HowitWorks from '../components/Home/HowitWorks'
import Gallery from "../components/Home/Gallery";
import Testimonials from "../components/Home/Testimonials";
import Pricing from "../components/Home/Pricing";
import CTA from "../components/Home/CTA";
import Footer from "../components/Home/Footer";

import { Stats } from "../components/Home/Stats";

import Header from "../components/Home/Header";

export default function Home() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState(''); // State for select value

  const slides = [
    {
      id: 1,
      title: "Edunext ERP",
      subtitle: "An advanced and comprehensive school management software",
      imageAlt: Hero1, // Placeholder for actual image
      tagline: "ERP",
    },
    {
      id: 2,
      title: "Advanced Admission CRM & Marketing tool for schools",
      subtitle: null,
      imageAlt: Hero2,
      tagline: "CRM",
    },
    {
      id: 3,
      title: "Helping 120+ Schools Globally",
      subtitle: "India's top 4 out of 10 residential schools run of Edunext",
      imageAlt: Hero3,
      tagline: "Success",
    },
  ];
  const navigate = useNavigate();


  const handleLoginTypeChange = (event) => {
    const value = event.target.value;
    setSelectedLoginType(value);
    if (value === 'user') {
      navigate('/user-login'); // Navigate to user login page
    } else if (value === 'admin') {
      navigate('/login'); // Navigate to admin login page (assuming /login is admin login)
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Header
        selectedLoginType={selectedLoginType}
        onLoginTypeChange={handleLoginTypeChange}
        onRegister={() => setShowRegistration(true)}
      />

      {/* Show Registration Form When Clicked */}
      <AnimatePresence>
        {showRegistration ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center bg-white/95 backdrop-blur-md shadow-xl shadow-red-900/20 p-8"
          >
            <RegistrationForm onClose={() => { setShowRegistration(false); navigate('/'); }} />
          </motion.div>
        ) : (
          <motion.main 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            {/* Hero Section */}
            <section id="home">
              <HeroSection />
            </section>

            {/* Features Section */}
            <section id="features">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <FeaturesSection />
              </motion.div>
            </section>

            {/*How it Works */}
            <section id="about">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <HowitWorks />
              </motion.div>
            </section>

            {/*Stats */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Stats id="stats"/>
            </motion.div>

            {/*Gallery */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Gallery id="Gallery"/>
            </motion.div>

            {/*Testimonials */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Testimonials id="Testimonials"/>
            </motion.div>

            {/* Pricing */}
            <section id="pricing">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <Pricing />
              </motion.div>
            </section>

            {/* CTA */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <CTA id='CTA'/>
            </motion.div>

            {/* Footer */}
            <section id="contact">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <Footer />
              </motion.div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}