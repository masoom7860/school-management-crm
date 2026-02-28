import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="animate-pulse">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {[...Array(rows)].map((_, index) => (
            <div key={index} className="px-6 py-4 flex items-center space-x-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </motion.div>
      ))}
    </div>
  );
};

const ChartSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </motion.div>
      ))}
    </div>
  );
};

const FormSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse max-w-2xl mx-auto">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      
      <div className="space-y-6">
        {/* Form fields */}
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
        
        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-white bg-opacity-30 rounded w-1/3"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        
        {/* Profile content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListSkeleton = ({ items = 8 }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="animate-pulse">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[...Array(items)].map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export {
  LoadingSkeleton,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListSkeleton
};