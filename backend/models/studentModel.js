const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }, // Added classId
  sectionName: { type: String },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }, // Added back sectionId as reference
  academicYear: { type: String }, // Added academicYear

  email: { type: String, unique: true, sparse: true }, // optional but useful
  password: { type: String, minlength: 8 }, // only required if login access is given
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockUntil: { type: Date },
  lastLogin: { type: Date },


  applicationNumber: { type: String },
  scholarNumber: { type: String },
  classAppliedFor: { type: String },
  section: { type: String },
  admissionDate: { type: Date },

  profilePhoto: { type: String },
  rollNumber: {type: Number},
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String },
  placeOfBirth: { type: String },
  nationality: { type: String },
  religion: { type: String },
  category: { type: String },
  aadharNumber: { type: String },

  residentialAddress: { type: String },
  permanentAddress: { type: String },

  legalCustodian: { type: String },
  languagesSpoken: {
    primary: { type: String },
    secondary: { type: String }
  },
  familyMembersCount: { type: Number },
  stayingWithGrandparents: { type: Boolean },
  familyType: { type: String },
  familyIncome: { type: String },
  yearsInCity: { type: String },

  currentSchoolStatus: { type: Boolean },
  currentSchoolName: { type: String },
  currentSchoolClass: { type: String },

  medicalInfo: {
    hasCondition: { type: Boolean },
    needsUrgentCare: { type: Boolean },
    conditionDetails: { type: String },
    schoolSupportNeeded: { type: String },
    bloodGroup: { type: String }
  },

  siblingInfo: {
    name: { type: String },
    scholarNumber: { type: String },
    class: { type: String },
    joiningYear: { type: String },
    currentSchool: { type: String },
    currentGrade: { type: String },
    gender: { type: String },
    age: { type: String }
  },

  previousSchools: [{
    year: { type: String },
    name: { type: String },
    classAttended: { type: String },
    reasonForLeaving: { type: String },
    leavingDate: { type: Date }
  }],

  insightForm: {
    physicalBeing: { type: String },
    languageRole: { type: String },
    emotionalSupport: { type: String },
    coCurricularOpinion: { type: String },
    collaborationOpinion: { type: String },
    curiositySupport: { type: String },
    childInterest: { type: String },
    moralEnvironment: { type: String },
    consciousTransformation: { type: String },
    teacherParentConnection: { type: String },
    techOpinion: { type: String },
    languageAppsExperience: { type: String },
    childActivities: { type: String },
    favoriteSubjects: { type: String },
    weakSubjects: { type: String },
    reasonForShiftingSchool: { type: String },
    appealOf: { type: String }
  },

  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
