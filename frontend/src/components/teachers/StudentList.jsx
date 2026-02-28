import React from "react"; // Import React

const StudentList = ({ students, loading, error }) => { // Accept students, loading, error as props

  if (loading) {
    return <div className="p-4">Loading students...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!students || students.length === 0) {
    return <div className="p-4">No students found for this school.</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg w-full">
      <h2 className="text-xl font-bold mb-4">All Students</h2> {/* Changed title */}

      {/* Search Inputs */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="text" placeholder="Search by Roll ..." className="border p-2 rounded w-full sm:w-1/3" />
        <input type="text" placeholder="Search by Name ..." className="border p-2 rounded w-full sm:w-1/3" />
        <input type="text" placeholder="Search by Class ..." className="border p-2 rounded w-full sm:w-1/3" />
        <button className="bg-yellow-500 text-white px-4 py-2 rounded w-full sm:w-auto">Search</button>
      </div>

      {/* FIXED BOX WITH SCROLLBAR BELOW */}
      <div className="border rounded-lg w-full overflow-hidden">
        <div className="overflow-auto max-h-[400px] w-full">
          <table className="w-full min-w-[900px] bg-white border border-gray-200">
            <thead className="sticky top-0 bg-gray-100 shadow">
              <tr className="text-left">
                <th className="border px-4 py-2"><input type="checkbox" /></th>
                <th className="border px-4 py-2">Roll</th>
                <th className="border px-4 py-2">Photo</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Gender</th>
                <th className="border px-4 py-2">Class</th>
                <th className="border px-4 py-2">Section</th>
                <th className="border px-4 py-2">Parents</th>
                <th className="border px-4 py-2">Address</th>
                <th className="border px-4 py-2">Date Of Birth</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">E-mail</th>
                <th className="border px-4 py-2">...</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => ( // Use student._id as key
                <tr key={student._id} className="text-center border">
                  <td className="border px-4 py-2"><input type="checkbox" /></td>
                  <td className="border px-4 py-2">{student.rollNumber}</td> {/* Use rollNumber */}
                  <td className="border px-4 py-2">
                    {/* Assuming student.photoUrl exists */}
                    <img src={student.photoUrl || 'https://i.pravatar.cc/40'} alt="profile" className="rounded-full w-8 h-8" />
                  </td>
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.gender}</td>
                  <td className="border px-4 py-2">{student.classAppliedFor}</td> {/* Use classAppliedFor */}
                  <td className="border px-4 py-2">{student.section}</td>
                  <td className="border px-4 py-2">{student.parentData?.father?.name || student.parentData?.mother?.name || student.parentData?.guardian?.name || 'N/A'}</td> {/* Use parent data */}
                  <td className="border px-4 py-2">{student.residentialAddress || 'N/A'}</td> {/* Use residentialAddress */}
                  <td className="border px-4 py-2">{student.dob}</td>
                  <td className="border px-4 py-2">{student.phone || 'N/A'}</td> {/* Assuming phone field exists */}
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">
                    {/* Add action buttons if needed, similar to AllStudent.jsx */}
                    ...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SCROLLBAR AT THE BOTTOM */}
        <div className="overflow-x-auto w-full">
          <div className="w-full min-w-[900px] h-4"></div>
        </div>
      </div>

      {/* Pagination Controls (keep for now, can be implemented later) */}
      <div className="flex justify-between items-center mt-4">
        <button className="px-4 py-2 border rounded">Previous</button>
        <span className="px-4 py-2 border bg-yellow-500 text-white">1</span>
        <button className="px-4 py-2 border rounded">Next</button>
      </div>
    </div>
  );
};

export default StudentList;
