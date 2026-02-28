// NotificationModal.jsx
import { useState, useEffect } from 'react';

const NotificationModal = ({ isOpen, onClose, onSubmit, isSubmitting, classes, academicYears, filter, setFilter }) => {
  const [notificationType, setNotificationType] = useState('email');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setNotificationType('email');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!filter.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!notificationType) newErrors.notificationType = 'Notification type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ academicYear: filter.academicYear, classId: filter.classId, notificationType });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Send Due Fee Notifications</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
            <select
              name="academicYear"
              value={filter.academicYear}
              onChange={(e) => setFilter(prev => ({ ...prev, academicYear: e.target.value }))}
              className={`w-full p-2 border rounded-md ${errors.academicYear ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year.value} value={year.value}>{year.label}</option>
              ))}
            </select>
            {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class (Optional)</label>
            <select
              name="classId"
              value={filter.classId}
              onChange={(e) => setFilter(prev => ({ ...prev, classId: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.className}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type <span className="text-red-500">*</span></label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.notificationType ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            {errors.notificationType && <p className="text-red-500 text-xs mt-1">{errors.notificationType}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Notifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;