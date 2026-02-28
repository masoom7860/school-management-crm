import React from "react";

const CourseManagement = () => {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Course Management</h2>

            {/* Table to display courses */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Course ID</th>
                        <th className="border border-gray-300 p-2">Course Name</th>
                        <th className="border border-gray-300 p-2">Instructor</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2">101</td>
                        <td className="border border-gray-300 p-2">Mathematics</td>
                        <td className="border border-gray-300 p-2">John Doe</td>
                        <td className="border border-gray-300 p-2">
                            <button className="bg-red-500 text-white px-2 py-1 rounded">Edit</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
                        </td>
                    </tr>
                    {/* Add more course rows dynamically */}
                </tbody>
            </table>

            {/* Button to add new course */}
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
                Add New Course
            </button>
        </div>
    );
};

export default CourseManagement;
