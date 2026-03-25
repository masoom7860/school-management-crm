import React from 'react';

export default function PricingSection() {
  const plans = [
    { name: 'Free', price: '$0/mo', features: ['Basic Features', 'Limited Students', 'No Online Payment'] },
    { name: 'Basic', price: '$29/mo', features: ['Full Student Management', 'Online Payments', 'Support'] },
    { name: 'Premium', price: '$49/mo', features: ['Advanced Analytics', 'Custom Branding', 'Priority Support'] },
  ];

  return (
    <section className="py-20 bg-gray-100 text-center">
  <h2 className="text-2xl font-bold text-gray-800">Flexible Pricing Plans</h2>
      <div className="flex flex-wrap justify-center gap-10 px-12 mt-10">
        {plans.map((plan, index) => (
          <div key={index} className="p-8 bg-white shadow-xl rounded-lg text-center w-80 transform hover:scale-105 transition-all">
            <h3 className="text-xl font-bold text-red-700">{plan.name}</h3>
            <p className="text-gray-700 text-lg mt-2 font-semibold">{plan.price}</p>
            <ul className="text-gray-600 mt-4 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i}>✅ {feature}</li>
              ))}
            </ul>
            <button className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
              Get {plan.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
