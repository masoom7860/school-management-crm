import React from 'react';
import { toast } from 'react-hot-toast';

const resultData = {
    studentInfo: {
        name: 'Rahul Sharma',
        admissionId: 'STU1021',
        class: '5',
        section: 'B',
        term: 'Term 1',
    },
    subjects: [
        { name: 'English', marks: 78, maxMarks: 100 },
        { name: 'Math', marks: 88, maxMarks: 100 },
        { name: 'Science', marks: 75, maxMarks: 100 },
        { name: 'Social Science', marks: 80, maxMarks: 100 },
        { name: 'Computer', marks: 92, maxMarks: 100 }
    ],
    remarks: 'Good performance. Keep it up!',
    resultStatus: 'Pass'
};

const ExaminationReport = () => {
    const handleSubmit = async () => {
        try {
            const res = await fetch('https://api.example.com/student-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resultData),
            });

            if (res.ok) {
                toast.success('Result submitted successfully!');
            } else {
                toast.error('Submission failed!');
            }
        } catch (error) {
            console.error('API error:', error);
        }
    };

    const totalMarks = resultData.subjects.reduce((sum, s) => sum + s.marks, 0);
    const maxMarks = resultData.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8 mt-10">
                <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Student Result</h2>

                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base mb-6">
                    <div><strong>Name:</strong> {resultData.studentInfo.name}</div>
                    <div><strong>Admission ID:</strong> {resultData.studentInfo.admissionId}</div>
                    <div><strong>Class:</strong> {resultData.studentInfo.class}</div>
                    <div><strong>Section:</strong> {resultData.studentInfo.section}</div>
                    <div><strong>Term:</strong> {resultData.studentInfo.term}</div>
                </div>

                {/* Subject-wise Marks */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full border border-gray-200 text-center">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border">Subject</th>
                                <th className="py-2 px-4 border">Marks Obtained</th>
                                <th className="py-2 px-4 border">Max Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultData.subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border">{subject.name}</td>
                                    <td className="py-2 px-4 border">{subject.marks}</td>
                                    <td className="py-2 px-4 border">{subject.maxMarks}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-yellow-50">
                                <td className="py-2 px-4 border">Total</td>
                                <td className="py-2 px-4 border">{totalMarks}</td>
                                <td className="py-2 px-4 border">{maxMarks}</td>
                            </tr>
                            <tr className="font-bold bg-green-50">
                                <td className="py-2 px-4 border">Percentage</td>
                                <td colSpan="2" className="py-2 px-4 border">{percentage}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Remarks & Result */}
                <div className="mb-6">
                    <p><strong>Result Status:</strong> <span className={`font-semibold ${resultData.resultStatus === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{resultData.resultStatus}</span></p>
                    <p className="mt-2"><strong>Remarks:</strong> {resultData.remarks}</p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl transition"
                    >
                        Submit Result
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExaminationReport;
