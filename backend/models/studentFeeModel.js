const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    mode: { type: String, enum: ['Cash', 'Cheque', 'UPI', 'Online'], required: true },
    date: { type: Date, default: Date.now },
    receiptNumber: { type: String, unique: true, required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Assuming a Staff model
    remark: { type: String },
    lateFeeComponent: { type: Number, default: 0 },
});

const studentFeeSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }, // Assuming a School model
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    academicYear: { type: String, required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true }, // Assuming a FeeStructure model
    dueDate: { type: Date },
    lateFeeEnabled: { type: Boolean, default: false },
    lateFeePerDay: { type: Number, min: 0, default: 10 },
    lateFeeGraceDays: { type: Number, min: 0, default: 0 },
    totalFee: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    lateFeePaid: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Partially Paid', 'Due'], default: 'Due' },
    payments: [paymentSchema],
}, { timestamps: true });
studentFeeSchema.index({ schoolId: 1, studentId: 1, academicYear: 1 }, { unique: true });
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

module.exports = StudentFee;
