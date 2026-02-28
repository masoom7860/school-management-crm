import React from 'react';

export default function ServiceCard({ icon: Icon, title, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
          {Icon ? <Icon className="h-7 w-7 text-blue-600" /> : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
    </div>
  );
}
