import React, { useState } from "react";
import { toast } from 'react-hot-toast';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New Password and Confirm Password do not match!");
            return;
        }
        toast.success("Password changed successfully!");
        // Implement API call for password change here
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                    <label className="block text-gray-700">Old Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">New Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Confirm New Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-red-500 text-white px-4 py-2 rounded"
                >
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
