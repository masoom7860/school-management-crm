const StudentFee = require('../models/studentFeeModel');
const FeeStructure = require('../models/feeStructureModel');
const Student = require('../models/studentModel');

const assignFeeToStudent = async (studentId) => {
  try {
    const student = await Student.findById(studentId).populate('classId schoolId');
    if (!student) {
      console.error(`Student with ID ${studentId} not found.`);
      return;
    }

    // Find the fee structure for the student's class, school, and academic year
    const feeStructure = await FeeStructure.findOne({
      classId: student.classId._id,
      schoolId: student.schoolId._id,
      academicYear: student.academicYear, // Ensure academicYear is used in lookup
    });

    if (!feeStructure) {
      console.warn(`No fee structure found for student ${studentId} in class ${student.classId.className} for school ${student.schoolId._id}.`);
      return;
    }

    // Remove hardcoded feeBreakdown and use components directly
    const components = feeStructure.components.map(comp => ({
        name: comp.name,
        amount: comp.amount
    }));

    // Calculate total fee from components and map to predefined fields
    let totalFeeAmount = 0;
    feeStructure.components.forEach(comp => {
        totalFeeAmount += comp.amount;
    });

    // Check if a studentFeeRecord already exists for this student and academic year
    let studentFeeRecord = await StudentFee.findOne({
      student: student._id, // Use student instead of studentId as per model
      academicYear: student.academicYear,
      schoolId: student.schoolId._id
    });

    if (studentFeeRecord) {
      // Update existing record if fee structure changed
      studentFeeRecord.classId = student.classId._id; // Update classId
      studentFeeRecord.components = components; // Update components
      studentFeeRecord.totalFee = totalFeeAmount;
      studentFeeRecord.balance = studentFeeRecord.totalFee - studentFeeRecord.amountPaid; // Recalculate balance
      // No need to regenerate dues on update for simplicity now, but could be added

    } else {
      // Create new record
      studentFeeRecord = new StudentFee({
        student: student._id,
        schoolId: student.schoolId._id,
        classId: student.classId._id, // Use classId from populated classId
        academicYear: student.academicYear,
        components: components, // Assign components directly
        totalFee: totalFeeAmount,
        amountPaid: 0,
        balance: totalFeeAmount,
        status: 'Pending',
        paymentHistory: [],
        receipts: [],
        dues: [] // Initialize dues array
      });

      // Generate periodic dues based on frequency
      const academicYearStartYear = parseInt(student.academicYear.split('-')[0]);
      const academicYearEndYear = parseInt(student.academicYear.split('-')[1]);
      const academicYearStartMonth = 3; // April (0-indexed)
      const academicYearEndMonth = 2; // March (0-indexed)

      if (feeStructure.frequency === 'Annual') {
          studentFeeRecord.dues.push({
              period: `Annual - ${student.academicYear}`,
              amount: totalFeeAmount,
              dueDate: new Date(academicYearEndYear, academicYearEndMonth, 31), // March 31st of end year
              status: 'Pending',
              paidAmount: 0,
              paymentEntries: []
          });
      } else if (feeStructure.frequency === 'Monthly') {
          for (let i = 0; i < 12; i++) {
              const monthIndex = (academicYearStartMonth + i) % 12;
              const year = academicYearStartYear + Math.floor((academicYearStartMonth + i) / 12);
              const dueDate = new Date(year, monthIndex, 15); // Example: Due 15th of the month

              studentFeeRecord.dues.push({
                  period: `${new Date(year, monthIndex).toLocaleString('default', { month: 'long' })} ${year}`,
                  amount: totalFeeAmount / 12,
                  dueDate: dueDate,
                  status: 'Pending',
                  paidAmount: 0,
                  paymentEntries: []
              });
          }
      } else if (feeStructure.frequency === 'Quarterly') {
           for (let i = 0; i < 4; i++) {
               const startMonthIndex = (academicYearStartMonth + i * 3) % 12;
               const year = academicYearStartYear + Math.floor((academicYearStartMonth + i * 3) / 12);
               // Due date is end of the quarter, roughly. E.g., for April-June quarter, due end of June.
               const dueDate = new Date(year, startMonthIndex + 2, new Date(year, startMonthIndex + 3, 0).getDate());

               studentFeeRecord.dues.push({
                   period: `Quarter ${i + 1} (${new Date(year, startMonthIndex).toLocaleString('default', { month: 'short' })}-${new Date(year, startMonthIndex + 2).toLocaleString('default', { month: 'short' })}) - ${year}`,
                   amount: totalFeeAmount / 4,
                   dueDate: dueDate,
                   status: 'Pending',
                   paidAmount: 0,
                   paymentEntries: []
               });
           }
      }
    }

    await studentFeeRecord.save();
    console.log(`Fee structure assigned/updated for student ${studentId}.`);

  } catch (error) {
    console.error(`Error assigning fee to student ${studentId}:`, error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

module.exports = {
  assignFeeToStudent
};
