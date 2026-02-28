import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ImageUploader({ label, name, value, onChange, previewUrl, setPreviewUrl }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ target: { name, value: file } });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange({ target: { name, value: null } });
    setPreviewUrl('');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      
      {previewUrl ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-2"
        >
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="rounded-lg w-24 h-24 object-cover border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </motion.div>
      ) : null}
      
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-gray-500">PNG, JPG (MAX. 800x400px)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*"
        />
      </label>
    </div>
  );
}
