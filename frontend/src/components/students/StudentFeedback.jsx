import React, { useState } from 'react';
import { Send, MessageSquareText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentFeedback = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Feedback:", form);
    toast.success('Thank you for your feedback!');
    setForm({ name: '', email: '', category: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <MessageSquareText className="text-red-600 w-7 h-7 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Complain / Feedback Form</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select category</option>
              <option value="Complain">Complain</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Write your message here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition duration-300"
          >
            <Send className="w-4 h-4" /> Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFeedback;
