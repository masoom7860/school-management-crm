import React, { useState } from 'react';

const initialFaqs = [
  {
    question: 'What is Ekattor 8?',
    answer:
      'Ekattor 8 is a collection of programs designed to assist schools in administering their executive responsibilities on a day-to-day basis. Ekattor 8 is an updated version of Ekattor ERP (Enterprise Resource Planning). Also, Ekattor 8 is designed for SAAS (Software as a Service) projects.',
  },
  {
    question: 'How can I get developed my customer features?',
    answer:
      'Custom features do not coming with product support. You can contact our support center and send us details about your requirement. If our schedule is open, we can give you a quotation and take your project according to the contract.',
  },
  {
    question: 'Which license to choose for my client project?',
    answer:
      'If you use academy LMS for a commercial project of a client, you will be required extended license.',
  },
  {
    question: 'How much time will I get developer support?',
    answer:
      'By default, you are entitled to developer support for 6 months from the date of your purchase. Later on anytime you can renew the support pack if you need developer support. If you don’t need any developer support, you don’t need to buy it.',
  },
];

export default function ManageFAQ() {
  const [faqs, setFaqs] = useState(initialFaqs);

  const handleAddFAQ = () => {
    const newFAQ = { question: 'New Question', answer: 'Answer goes here...' };
    setFaqs([...faqs, newFAQ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Faq</h1>
          <p className="text-sm text-gray-500">Frequently asked questions</p>
        </div>
        <button
          onClick={handleAddFAQ}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
        >
          Add question and answer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg shadow p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {faq.question}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
            </div>
            <button className="mt-4 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded self-start">
              Action
            </button>
          </div>
        ))}
      </div>

      <footer className="text-center text-sm text-gray-500 mt-10">
        2025 ©{' '}
        <a href="#" className="text-sky-500 hover:underline">
          By Zosto Technology
        </a>
      </footer>
    </div>
  );
}
