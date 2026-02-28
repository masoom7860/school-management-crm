import React from "react";

const ManagementFrontWebsite = () => {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Welcome to School Management CRM</h2>
            <p className="text-gray-700 mb-4">
                Manage your school efficiently with our CRM. Navigate through different sections to handle students, teachers, parents, and administrative tasks seamlessly.
            </p>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-500 text-white rounded-lg shadow-md text-center">
                    <a href="/admin" className="block">Admin Dashboard</a>
                </div>
                <div className="p-4 bg-green-500 text-white rounded-lg shadow-md text-center">
                    <a href="/teacher" className="block">Teacher Portal</a>
                </div>
                <div className="p-4 bg-yellow-500 text-white rounded-lg shadow-md text-center">
                    <a href="/student" className="block">Student Dashboard</a>
                </div>
                <div className="p-4 bg-purple-500 text-white rounded-lg shadow-md text-center">
                    <a href="/parent" className="block">Parent Portal</a>
                </div>
                <div className="p-4 bg-red-500 text-white rounded-lg shadow-md text-center">
                    <a href="/staff" className="block">Staff Management</a>
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-bold">About Our CRM</h3>
                <p className="text-gray-700">
                    Our School Management CRM is designed to simplify the administration of educational institutions. With easy access for different roles, secure data management, and automation features, managing a school has never been easier.
                </p>
            </div>
        </div>
    );
};

export default ManagementFrontWebsite;
