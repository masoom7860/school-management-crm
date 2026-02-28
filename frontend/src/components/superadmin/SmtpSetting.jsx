import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SmtpSetting() {
  const [smtpConfig, setSmtpConfig] = useState({
    protocol: 'smtp',
    crypto: 'tls',
    host: 'smtp.gmail.com',
    port: '587',
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('SMTP Settings Saved');
    console.log(smtpConfig); // Replace this with an API call if needed
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">SMTP Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="protocol">
            Protocol (smtp, ssmtp, mail)
          </label>
          <select
            id="protocol"
            name="protocol"
            value={smtpConfig.protocol}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="smtp">smtp</option>
            <option value="ssmtp">ssmtp</option>
            <option value="mail">mail</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="crypto">
            SMTP Crypto (ssl or tls)
          </label>
          <select
            id="crypto"
            name="crypto"
            value={smtpConfig.crypto}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="ssl">ssl</option>
            <option value="tls">tls</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="host">
            SMTP Host
          </label>
          <input
            id="host"
            type="text"
            name="host"
            placeholder="smtp.gmail.com"
            value={smtpConfig.host}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="port">
            SMTP Port
          </label>
          <input
            id="port"
            type="text"
            name="port"
            placeholder="587"
            value={smtpConfig.port}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            SMTP Username
          </label>
          <input
            id="username"
            type="email"
            name="username"
            placeholder="your-email@example.com"
            value={smtpConfig.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            SMTP Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={smtpConfig.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Save
        </button>
      </form>

       {/* Footer */}
       <footer className="text-sm text-center text-gray-500 mt-6">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology </a>
      </footer>
    </div>
  );
}
