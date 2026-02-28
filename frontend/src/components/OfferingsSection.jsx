// OfferingsSection.jsx (Updated for Zosto Technology)

import React from 'react';
import ServiceCard from './ServiceCard';

// Updated Dummy Icons (Replace with actual SVG/React Icons like Lucide or react-icons)
// Representing: Custom Software, Cloud, Mobile/Web, Digital Marketing/Consulting
const IconCustomSoftware = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75l-4.5 4.5 4.5 4.5M10.5 18L10 18A2 2 0 018 16V8A2 2 0 0110 6h4A2 2 0 0116 8v2M20 10V8A2 2 0 0018 6h-2M4 14v2A2 2 0 006 18h2" /></svg>;
const IconCloudServices = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a8.25 8.25 0 012.108-5.753 6.002 6.002 0 003.896-1.57C8.125 3.327 9.5 3 12 3s3.875.327 3.796 1.677a6.002 6.002 0 003.896 1.57A8.25 8.25 0 0121.75 12M12 21.75v-9m0 0l-3.75 3.75M12 12l3.75 3.75" /></svg>;
const IconMobileWeb = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1h3M12 21v-3.75M12 21h.008M21 15V9A2 2 0 0019 7H5A2 2 0 003 9v6a2 2 0 002 2h14a2 2 0 002-2zM6 11.25h12M6 15.75h12" /></svg>;
const IconDigitalStrategy = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" /></svg>;


// --- Zosto Technology Specific Data ---
const serviceData = [
    {
        title: 'Custom Software Development',
        description: 'Bespoke solutions built from the ground up to perfectly streamline your processes, increase efficiency, and drive business growth.',
        icon: IconCustomSoftware,
    },
    {
        title: 'Cloud & Infrastructure Services',
        description: 'From cloud migration to infrastructure management, we provide scalable, secure, and cost-effective cloud solutions (AWS, Azure, GCP).',
        icon: IconCloudServices,
    },
    {
        title: 'Mobile & Web App Development',
        description: 'Crafting innovative, user-friendly, and responsive digital experiences for iOS, Android, and the Web to engage your customers.',
        icon: IconMobileWeb,
    },
    {
        title: 'Digital Marketing & Strategy',
        description: 'Expert IT consulting, SEO, and strategic digital solutions to enhance your online presence and ensure you stay ahead in the digital era.',
        icon: IconDigitalStrategy,
    },
];

const tabs = ['Web Development', 'Mobile App', 'Cloud Services', 'IT Consulting', 'Cybersecurity'];
// --- End Zosto Technology Specific Data ---


const OfferingsSection = () => {
    // State for active tab, could be used to filter serviceData if needed
    const [activeTab, setActiveTab] = React.useState('Web Development');

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                
                {/* --- Section Header --- */}
                <header className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                        Zosto Technology's Core **Solutions**
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        A premier IT solutions provider, we offer innovative and scalable digital services to empower businesses and drive successful digital transformation.
                    </p>
                </header>

                {/* --- Navigation Pills/Tabs (Responsive) --- */}
                <div className="flex flex-wrap justify-center gap-2 mb-16">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out
                                ${
                                    activeTab === tab
                                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- Services Grid (Responsive) --- */}
                <div className="
                    grid gap-8 
                    sm:grid-cols-2 
                    lg:grid-cols-4 
                    
                ">
                    {serviceData.map((service, index) => (
                        <ServiceCard 
                            key={index} 
                            icon={service.icon} 
                            title={service.title} 
                            description={service.description} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OfferingsSection;

/* * NOTE: The ServiceCard.jsx component from the previous response must be 
* available and correctly imported for the code above to work, 
* ensuring the hover animations and modern UI styling are applied.
*/
