const Attendance = require('../models/attendanceModel');
const mongoose = require('mongoose'); // Import mongoose
const Student = require('../models/studentModel'); // Import Student model
const ExcelJS = require('exceljs');

const markAttendance = async (req, res) => {
    const { studentId, schoolId, date, status, recordedBy, note } = req.body;
    try {
        const existing = await Attendance.findOne({ studentId, date });
        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
        }

        const attendance = new Attendance({ studentId, schoolId, date, status, recordedBy, note });
        await attendance.save();

        res.status(201).json({ message: 'Attendance marked', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
};

const getAttendanceBySchool = async (req, res) => {
    const { schoolId } = req.params;
    try {
        const records = await Attendance.find({ schoolId }).populate('studentId', 'name email');
        res.status(200).json({ records });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

const getStudentAttendance = async (req, res) => {
    const { studentId } = req.params;
    try {
        const records = await Attendance.find({ studentId });
        res.status(200).json({ records });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};


const updateAttendance = async (req, res) => {
    const { attendanceId } = req.params;
    const updates = req.body;
    try {
        const record = await Attendance.findByIdAndUpdate(attendanceId, updates, { new: true });
        res.status(200).json({ message: 'Attendance updated', record });
    } catch (error) {
        res.status(500).json({ message: 'Error updating attendance', error: error.message });
    }
};


const deleteAttendance = async (req, res) => {
    const { attendanceId } = req.params;
    try {
        await Attendance.findByIdAndDelete(attendanceId);
        res.status(200).json({ message: 'Attendance deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attendance', error: error.message });
    }
};

const getStudentsByTeacher = async (req, res) => {
    const { teacherId } = req.params;
    try {
        // Find students where classTeacherId matches the provided teacherId
        const students = await Student.find({ classTeacherId: teacherId }).select('_id name'); // Use imported Student model

        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students by teacher', error: error.message });
    }
};

const markBatchAttendance = async (req, res) => {
    const { attendanceRecords } = req.body; // Expecting an array of records

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
        return res.status(400).json({ message: 'No attendance records provided' });
    }

    try {
        const results = [];
        for (const record of attendanceRecords) {
            const { studentId, schoolId, date, status, recordedBy, note } = record;

            // Validate required fields for each record (basic check)
            if (!studentId || !schoolId || !date || !status || !recordedBy) {
                 console.error("Missing required field in attendance record:", record);
                 // Decide how to handle invalid records: skip, return error, etc.
                 // For now, we'll log and continue, but a real app might need stricter validation
                 continue;
            }


            // Find and update existing record or create a new one
            const updatedRecord = await Attendance.findOneAndUpdate(
                { studentId, date },
                { $set: { schoolId, status, recordedBy, note } },
                { upsert: true, new: true } // upsert: create if not found, new: return updated doc
            );
            results.push(updatedRecord);
        }

        // Check if any records were processed successfully
        if (results.length === 0) {
             return res.status(400).json({ message: 'No valid attendance records processed' });
        }


        res.status(200).json({ message: 'Batch attendance marked/updated', records: results });
    } catch (error) {
        console.error('Error marking batch attendance:', error); // Log the actual error on the backend
        res.status(500).json({ message: 'Error marking batch attendance', error: error.message });
    }
};

// Function to generate attendance report (CSV or XLSX)
const generateAttendanceReport = async (req, res) => {
    const { teacherId, startDate, endDate } = req.query; // Get criteria from query params

    if (!teacherId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Teacher ID, start date, and end date are required' });
    }

    try {
        // Find students assigned to the teacher
        const students = await Student.find({ classTeacherId: teacherId }).select('_id name').lean(); // Use .lean() for plain JS objects

        const studentIds = students.map(student => student._id);

        // Find attendance records for these students within the date range
        const attendanceRecords = await Attendance.find({
            studentId: { $in: studentIds },
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('studentId', 'name').lean(); // Populate student name and use .lean()

        // Group attendance by student and date for easier processing
        const attendanceByStudentAndDate = attendanceRecords.reduce((acc, record) => {
            const dateKey = record.date.toISOString().slice(0, 10); // YYYY-MM-DD
            if (!acc[record.studentId._id]) {
                acc[record.studentId._id] = { name: record.studentId.name, dates: {} };
            }
            acc[record.studentId._id].dates[dateKey] = record.status;
            return acc;
        }, {});

        const dates = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        while (currentDate <= lastDate) {
            dates.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const { format } = req.query;
        if ((format || '').toLowerCase() === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Attendance');

            const header = ['Student Name', ...dates];
            worksheet.addRow(header);

            students.forEach(student => {
                const row = [student.name, ...dates.map(d => (attendanceByStudentAndDate[student._id]?.dates[d] || 'N/A'))];
                worksheet.addRow(row);
            });

            worksheet.columns.forEach((col, i) => {
                const len = Math.max(...col.values.map(v => (v ? String(v).length : 0)), 12);
                col.width = Math.min(Math.max(len + 2, 12), 40);
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${teacherId}_${startDate}_to_${endDate}.xlsx`);
            await workbook.xlsx.write(res);
            return res.end();
        } else {
            let csvContent = 'Student Name';
            csvContent += ',' + dates.join(',') + '\n';
            students.forEach(student => {
                csvContent += `"${student.name}"`;
                dates.forEach(date => {
                    const status = attendanceByStudentAndDate[student._id]?.dates[date] || 'N/A';
                    csvContent += `,${status}`;
                });
                csvContent += '\n';
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${teacherId}_${startDate}_to_${endDate}.csv`);
            return res.status(200).send(csvContent);
        }

    } catch (error) {
        res.status(500).json({ message: 'Error generating attendance report', error: error.message });
    }
};


module.exports = {
    deleteAttendance,
    updateAttendance,
    getStudentAttendance,
    getAttendanceBySchool,
    markAttendance,
    getStudentsByTeacher,
    markBatchAttendance,
    generateAttendanceReport // Export the new function
}
