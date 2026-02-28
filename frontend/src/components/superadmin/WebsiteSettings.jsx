import React, { useState } from 'react';

export default function WebsiteSettings() {
  const [formData, setFormData] = useState({
    systemTitle: '',
    bannerTitle: '',
    bannerSubtitle: '',
    featuresTitle: '',
    featuresSubtitle: '',
    priceSubtitle: '',
    faqSubtitle: '',
    facebookLink: '',
    twitterLink: '',
    linkedinLink: '',
    instagramLink: '',
    contactMail: '',
    footerText: '',
    copyrightText: '',
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    enableRecaptcha: false
  });

  const [features, setFeatures] = useState([
    { title: '', description: '', icon: '' }
  ]);

  const [logo, setLogo] = useState(null);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const addFeature = () => {
    setFeatures([...features, { title: '', description: '', icon: '' }]);
  };

  const removeFeature = (index) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Website Settings:', formData);
    console.log('Frontend Features:', features);
    console.log('Frontend Logo:', logo);
    // Replace with API integration if needed
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg space-y-8">
      <h2 className="text-2xl font-bold">Website Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'System Title', name: 'systemTitle' },
          { label: 'Banner Title', name: 'bannerTitle' },
          { label: 'Banner Subtitle', name: 'bannerSubtitle' },
          { label: 'Features Title', name: 'featuresTitle' },
          { label: 'Features Subtitle', name: 'featuresSubtitle' },
          { label: 'Price Subtitle', name: 'priceSubtitle' },
          { label: 'FAQ Subtitle', name: 'faqSubtitle' },
          { label: 'Facebook Link', name: 'facebookLink' },
          { label: 'Twitter Link', name: 'twitterLink' },
          { label: 'LinkedIn Link', name: 'linkedinLink' },
          { label: 'Instagram Link', name: 'instagramLink' },
          { label: 'Contact Mail', name: 'contactMail' },
          { label: 'Footer Text', name: 'footerText' },
          { label: 'Copyright Text', name: 'copyrightText' },
          { label: 'reCAPTCHA Site Key', name: 'recaptchaSiteKey' },
          { label: 'reCAPTCHA Secret Key', name: 'recaptchaSecretKey' }
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="enableRecaptcha"
          checked={formData.enableRecaptcha}
          onChange={handleFormChange}
        />
        <label className="text-sm font-medium text-gray-700">Enable reCAPTCHA</label>
      </div>

      {/* Frontend Features */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Frontend Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-lg p-4 shadow">
              <label className="block text-sm font-medium text-gray-700">Features List Title</label>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />

              <label className="block text-sm font-medium text-gray-700 mt-3">Short Description</label>
              <textarea
                rows={3}
                value={feature.description}
                onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />

              <label className="block text-sm font-medium text-gray-700 mt-3">Features List Image</label>
              <input
                type="text"
                value={feature.icon}
                onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={() => removeFeature(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFeature}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          + Add Frontend Features
        </button>
      </div>

      {/* Website Logo Upload */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Website Logo</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frontend Logo</label>
        <div className="border rounded-md p-4 flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-600"
          />
        </div>
        <button
          type="button"
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Update Logo
        </button>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Save All Changes
      </button>
       {/* Footer */}
       <footer className="text-sm text-center text-gray-500 mt-10">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology</a>
      </footer>
    </form>
    
    
  );
}
