const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: false
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
    required: true,
    default: 'yearly'
  },
  components: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    isTaxable: {
      type: Boolean,
      default: false
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  dueDate: {
    type: Date,
    required: function() { return this.frequency !== 'one-time'; }
  },
  lateFeeEnabled: {
    type: Boolean,
    default: false
  },
  lateFeePerDay: {
    type: Number,
    min: 0,
    default: 10
  },
  lateFeeGraceDays: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Removed unique index constraint
// Add virtual populate for class and section
feeStructureSchema.virtual('classDetails', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true
});

feeStructureSchema.virtual('sectionDetails', {
  ref: 'Section',
  localField: 'sectionId',
  foreignField: '_id',
  justOne: true
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;