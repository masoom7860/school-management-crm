import React, { useState } from "react";

const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([
        { id: 1, user: "John Doe (Student)", complaint: "Issue with online classes.", status: "Pending" },
        { id: 2, user: "Jane Smith (Teacher)", complaint: "Salary not credited.", status: "Resolved" },
    ]);

    // Function to update status
    const updateStatus = (id, newStatus) => {
        setComplaints(complaints.map(complaint =>
            complaint.id === id ? { ...complaint, status: newStatus } : complaint
        ));
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Complaint Management</h2>

            {/* Complaint Form */}
            <div className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="text-lg font-bold">Submit a Complaint</h3>
                <input type="text" placeholder="Your Name" className="border p-2 w-full mt-2 rounded" />
                <textarea placeholder="Enter your complaint..." className="border p-2 w-full mt-2 rounded"></textarea>
                <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
                    Submit Complaint
                </button>
            </div>

            {/* Complaint List */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">ID</th>
                        <th className="border border-gray-300 p-2">User</th>
                        <th className="border border-gray-300 p-2">Complaint</th>
                        <th className="border border-gray-300 p-2">Status</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {complaints.map(({ id, user, complaint, status }) => (
                        <tr key={id}>
                            <td className="border border-gray-300 p-2">{id}</td>
                            <td className="border border-gray-300 p-2">{user}</td>
                            <td className="border border-gray-300 p-2">{complaint}</td>
                            <td className="border border-gray-300 p-2">{status}</td>
                            <td className="border border-gray-300 p-2">
                                <button
                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                    onClick={() => updateStatus(id, "Resolved")}
                                >
                                    Resolve
                                </button>
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => updateStatus(id, "Rejected")}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ComplaintManagement;
