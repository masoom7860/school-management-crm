import React from 'react';

export default function AboutSection() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4">About this application</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="font-medium">Software version</div>
        <div>2.2</div>

        <div className="font-medium">PHP version</div>
        <div>8.2.28</div>

        <div className="font-medium">Curl enable</div>
        <div>Enabled</div>

        <div className="font-medium">Purchase code</div>
        <div>Invalid</div>

        <div className="font-medium">Product license</div>
        <div>Invalid</div>

        <div className="font-medium">Customer support status</div>
        <div>Invalid</div>

        <div className="font-medium">Support expiry date</div>
        <div>Invalid</div>

        <div className="font-medium">Customer name</div>
        <div>Invalid</div>
      </div>

      <div className="flex gap-4 mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Check update
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Get customer support
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        2022 © By Creativeitem
      </p>
    </div>
  );
}
