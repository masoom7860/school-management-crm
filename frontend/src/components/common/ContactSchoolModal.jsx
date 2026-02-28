import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

export default function ContactSchoolModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  };
  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  const [formData, setFormData] = useState({ name: '', school: '', email: '', phone: '', message: '' });
  const [touched, setTouched] = useState({ name: false, school: false, email: false, phone: false, message: false });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  const validate = (values) => {
    const errs = {};
    const name = (values.name || '').trim();
    const school = (values.school || '').trim();
    const email = (values.email || '').trim();
    const phone = (values.phone || '').trim();
    const message = values.message || '';

    if (!name) errs.name = 'Full name is required';
    else if (name.length < 2) errs.name = 'Enter a valid name';

    if (!school) errs.school = 'School name is required';

    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = 'Enter a valid email';

    if (!phone) errs.phone = 'Phone is required';
    else {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) errs.phone = 'Enter a valid phone number';
    }

    if (message.length > 500) errs.message = 'Message should be under 500 characters';
    return errs;
  };

  const showError = (field) => !!errors[field] && (touched[field] || submitted);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, ...validate({ ...formData, [name]: value }) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, ...validate(formData) }));
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setFormData({ name: '', school: '', email: '', phone: '', message: '' });
      setTouched({ name: false, school: false, email: false, phone: false, message: false });
      setErrors({});
      setSubmitted(false);
      setIsSubmitting(false);
      setServerError('');
      setServerSuccess('');
    }
  }, [open]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');
    setServerSuccess('');
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length) {
      return;
    }
    try {
      setIsSubmitting(true);
      const { data } = await axiosInstance.post('/api/contact/create', formData);
      const msg = data?.message || 'Thanks! We will contact you shortly.';
      setServerSuccess(msg);
      setTimeout(() => {
        onClose?.();
      }, 900);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit. Please try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={dialogRef}
            className="relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <div className="relative rounded-t-2xl bg-gradient-to-r from-yellow-400 to-red-600 px-6 py-5 overflow-hidden">
              <motion.span
                className="pointer-events-none absolute -top-8 -right-10 h-32 w-32 rounded-full bg-white/20 blur-2xl"
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
              />
              <motion.span
                className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10 blur-2xl"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.1, opacity: 0.7 }}
                transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse' }}
              />
              <div className="relative z-10 flex items-start justify-between">
                <h3 className="text-xl bold text-black">Contact School</h3>
                <button type="button" onClick={onClose} className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 hover:text-white">
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              <p className="relative z-10 mt-2 text-sm text-white/90">Start your free trial. Share your details and we'll reach out shortly.</p>
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
              <AnimatePresence>
                {serverSuccess && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-200">
                    {serverSuccess}
                  </motion.div>
                )}
                {serverError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-3 rounded-lg bg-red-50 px-3 py:2 text-sm text-red-700 border border-red-200">
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2" variants={containerVariants} initial="hidden" animate="show">
                <motion.div variants={itemVariants} className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={showError('name')}
                    aria-describedby={showError('name') ? 'error-name' : undefined}
                    className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${showError('name') ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-red-200 focus:border-red-500'}`}
                    placeholder="Your name"
                  />
                  <AnimatePresence>
                    {showError('name') && (
                      <motion.p id="error-name" role="alert" className="mt-1 text-xs text-red-600" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div variants={itemVariants} className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">School Name</label>
                  <input
                    name="school"
                    type="text"
                    required
                    value={formData.school}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={showError('school')}
                    aria-describedby={showError('school') ? 'error-school' : undefined}
                    className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${showError('school') ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-yellow-200 focus:border-yellow-500'}`}
                    placeholder="Your school"
                  />
                  <AnimatePresence>
                    {showError('school') && (
                      <motion.p id="error-school" role="alert" className="mt-1 text-xs text-red-600" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                        {errors.school}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div variants={itemVariants} className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={showError('email')}
                    aria-describedby={showError('email') ? 'error-email' : undefined}
                    className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${showError('email') ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-red-200 focus:border-red-500'}`}
                    placeholder="you@example.com"
                  />
                  <AnimatePresence>
                    {showError('email') && (
                      <motion.p id="error-email" role="alert" className="mt-1 text-xs text-red-600" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div variants={itemVariants} className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={showError('phone')}
                    aria-describedby={showError('phone') ? 'error-phone' : undefined}
                    className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${showError('phone') ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-yellow-200 focus:border-yellow-500'}`}
                    placeholder="00000 00000"
                  />
                  <AnimatePresence>
                    {showError('phone') && (
                      <motion.p id="error-phone" role="alert" className="mt-1 text-xs text-red-600" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                        {errors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div variants={itemVariants} className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={500}
                    aria-invalid={showError('message')}
                    aria-describedby={showError('message') ? 'error-message' : undefined}
                    className={`w-full resize-none rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${showError('message') ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-red-200 focus:border-red-500'}`}
                    placeholder="Tell us about your needs"
                  />
                  <AnimatePresence>
                    {showError('message') && (
                      <motion.p id="error-message" role="alert" className="mt-1 text-xs text-red-600" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                        {errors.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClose} disabled={isSubmitting} className={`rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>Cancel</motion.button>
                <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className={`rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2 font-medium text-white shadow hover:from-red-700 hover:to-red-800 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Submitting...' : 'Request Demo'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
