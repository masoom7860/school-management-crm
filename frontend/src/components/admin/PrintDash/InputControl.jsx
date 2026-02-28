import React from 'react';

const InputControl = ({ label, value, onChange, isText = false, children, placeholder, disabled = false }) => {
  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      {isText ? (
        <input
          type="text"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={onChange}
          placeholder={placeholder || (label ? `Enter ${label}` : '')}
          disabled={disabled}
        />
      ) : (
        <select
          className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {children}
        </select>
      )}
    </div>
  );
};

export default InputControl;
