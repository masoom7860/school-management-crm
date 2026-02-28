import React from "react";
import RegistrationForm from "../RegistrationForm";

const CreateSchoolForm = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create School</h2>
        <p className="text-sm text-gray-500">Home - Schools - Create School</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-1">School Form</h3>
        <p className="text-sm text-gray-500 mb-6">
          Provide all the information required for your school. Also provide an admin information with email and password. So that admin can access the created school.
        </p>
        <RegistrationForm mode="superadmin" />
      </div>
    </div>
  );
};

export default CreateSchoolForm;
