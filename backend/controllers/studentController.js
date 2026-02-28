const Student = require('../models/studentModel');
const Parent = require('../models/parentModel');
const Teacher = require('../models/teacherModel');
const School = require('../models/registarSchoolModel'); // Import School model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyOtp } = require('./otpController');
const Otp = require('../models/otp');
const Section = require('../models/section'); // Import Section model
const { assignFeeToStudent } = require('../utils/feeAssignment'); // Import the fee assignment utility

const fs = require('fs');
const path = require('path');

// Create a student and parent from detailed form
const createStudent = async (req, res) => {
  // Parse JSON fields if they were sent via multipart/form-data
  let { studentData, parentData, medicalInfo, siblingInfo, previousSchools, insightForm, adminId, schoolId } = req.body;

  try {
    if (typeof studentData === 'string') studentData = JSON.parse(studentData);
    if (typeof parentData === 'string') parentData = JSON.parse(parentData);
    if (typeof medicalInfo === 'string') medicalInfo = JSON.parse(medicalInfo);
    if (typeof siblingInfo === 'string') siblingInfo = JSON.parse(siblingInfo);
    if (typeof previousSchools === 'string') previousSchools = JSON.parse(previousSchools);
    if (typeof insightForm === 'string') insightForm = JSON.parse(insightForm);

    if (!studentData || !parentData || !adminId || !schoolId) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    // Hash student password (use default if none provided)
    const studentPasswordPlain = studentData.password || 'student123';
    const hashedStudentPassword = await bcrypt.hash(studentPasswordPlain, 10);

    // Check for existing parent by email or mobile
    let parent = await Parent.findOne({
      schoolId,
      $or: [
        parentData.father?.email && { 'father.email': parentData.father.email },
        parentData.mother?.email && { 'mother.email': parentData.mother.email },
        parentData.father?.mobile && { 'father.mobile': parentData.father.mobile },
        parentData.mother?.mobile && { 'mother.mobile': parentData.mother.mobile }
      ].filter(Boolean)
    });

    // Create new parent if not found
    if (!parent) {
      parent = new Parent({
        ...parentData,
        schoolId,
        createdBy: adminId,
        password: 'parent123' // this will be hashed by schema middleware
      });
      await parent.save();
    }

    // Find the school and atomically increment the last application number
    const school = await School.findByIdAndUpdate(
      schoolId,
      { $inc: { lastApplicationNumber: 1 } },
      { new: true, runValidators: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Create new student
    console.log('studentData in createStudent:', studentData);
    const newStudent = new Student({
      ...studentData,
      schoolId,
      createdBy: adminId,
      parentId: parent._id,
      password: hashedStudentPassword,
      applicationNumber: school.lastApplicationNumber.toString(), // Assign the incremented number
      sectionId: studentData.sectionId // Assign sectionId
    });

    // Add uploaded image path if present (supports upload.fields and upload.single)
    if (req.files && req.files['studentPhoto'] && req.files['studentPhoto'][0]) {
      newStudent.profilePhoto = req.files['studentPhoto'][0].path;
    } else if (req.files && req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
      newStudent.profilePhoto = req.files['profilePhoto'][0].path;
    } else if (req.file) {
      newStudent.profilePhoto = req.file.path;
    }

    await newStudent.save();

    // Add student to parent's children list
    parent.children.push(newStudent._id);
    await parent.save();

    // Fee assignment will now be handled explicitly by staff in StudentFeeManagement
    // No automatic fee assignment during student creation.

    res.status(201).json({
      message: 'Student and Parent created successfully',
      student: newStudent, // Include the new student object
      studentLogin: {
        email: newStudent.email || 'not set',
        password: studentPasswordPlain
      },
      parentId: parent._id,
      parentLogin: {
        email: parent.father?.email || parent.mother?.email || 'not set',
        password: 'parent123'
      }
    });

  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// const createStudent = async (req, res) => {
//   const { studentData, parentData, adminId, schoolId } = req.body;

//   if (!studentData || !parentData || !adminId || !schoolId) {
//     return res.status(400).json({ message: 'Missing required data' });
//   }

//   try {
//     // Parse from string if coming via multipart/form-data
//     const parsedStudentData = typeof studentData === 'string' ? JSON.parse(studentData) : studentData;
//     const parsedParentData = typeof parentData === 'string' ? JSON.parse(parentData) : parentData;

//     const studentPasswordPlain = parsedStudentData.password || 'student123';
//     const hashedStudentPassword = await bcrypt.hash(studentPasswordPlain, 10);

//     // Attach photos if available
//     if (req.files['studentPhoto']) {
//       parsedStudentData.profilePhoto = req.files['studentPhoto'][0].path;
//     }
//     if (req.files['fatherPhoto']) {
//       parsedParentData.father = parsedParentData.father || {};
//       parsedParentData.father.photo = req.files['fatherPhoto'][0].path;
//     }
//     if (req.files['motherPhoto']) {
//       parsedParentData.mother = parsedParentData.mother || {};
//       parsedParentData.mother.photo = req.files['motherPhoto'][0].path;
//     }
//     if (req.files['guardianPhoto']) {
//       parsedParentData.guardian = parsedParentData.guardian || {};
//       parsedParentData.guardian.photo = req.files['guardianPhoto'][0].path;
//     }

//     // Check for existing parent
//     let parent = await Parent.findOne({
//       schoolId,
//       $or: [
//         parsedParentData.father?.email && { 'father.email': parsedParentData.father.email },
//         parsedParentData.mother?.email && { 'mother.email': parsedParentData.mother.email },
//         parsedParentData.father?.mobile && { 'father.mobile': parsedParentData.father.mobile },
//         parsedParentData.mother?.mobile && { 'mother.mobile': parsedParentData.mother.mobile }
//       ].filter(Boolean)
//     });

//     if (!parent) {
//       parent = new Parent({
//         ...parsedParentData,
//         schoolId,
//         createdBy: adminId,
//         password: 'parent123'
//       });
//       await parent.save();
//     }

//     const newStudent = new Student({
//       ...parsedStudentData,
//       schoolId,
//       createdBy: adminId,
//       parentId: parent._id,
//       password: hashedStudentPassword
//     });

//     await newStudent.save();

//     parent.children.push(newStudent._id);
//     await parent.save();

//     res.status(201).json({
//       message: 'Student and Parent created successfully',
//       studentId: newStudent._id,
//       studentLogin: {
//         email: newStudent.email || 'not set',
//         password: studentPasswordPlain
//       },
//       parentId: parent._id,
//       parentLogin: {
//         email: parent.father?.email || parent.mother?.email || 'not set',
//         password: 'parent123'
//       }
//     });

//   } catch (error) {
//     console.error('Create Student Error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };




const getStudentById = async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) return res.status(400).json({ message: 'Student ID is required' });

  try {
    const student = await Student.findById(studentId)
      .populate('parentId')
      .populate('classTeacherId', 'name email')
      .populate('sectionId');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student fetched successfully',
      student
    });
  } catch (error) {
    console.error('Get Student Error:', error);
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const updateData = req.body; // Flattened data from frontend
  const files = req.files; // Files from upload.fields

  console.log('updateData in updateStudent:', updateData); // Log updateData
  console.log('Received updateData:', updateData); // Keep this log

  if (!studentId) {
    console.error('Update Student Error: Student ID is required'); // Log this error
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    console.log('Attempting to find existing student:', studentId); // Log before finding student
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      console.error('Update Student Error: Student not found', studentId); // Log this error
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Existing student found:', existingStudent._id); // Log after finding student


    console.log('Attempting to find associated parent:', existingStudent.parentId); // Log before finding parent
    const existingParent = await Parent.findById(existingStudent.parentId);
    if (!existingParent) {
      console.error('Update Student Error: Parent not found for student', studentId); // Log this error
      return res.status(404).json({ message: 'Parent not found for this student' });
    }
    console.log('Existing parent found:', existingParent._id); // Log after finding parent


    // Prepare update objects for Student and Parent using flattened keys with dot notation
    const studentUpdate = {};
    const parentUpdate = {};

    // Create a mutable copy of updateData to safely modify
    const mutableUpdateData = { ...updateData };

    // Explicitly handle classTeacherId._id before iterating and remove other classTeacherId fields
    if (mutableUpdateData['classTeacherId._id']) {
        studentUpdate.classTeacherId = mutableUpdateData['classTeacherId._id']; // Use the ObjectId value
        console.log(`Setting studentUpdate.classTeacherId to: ${studentUpdate.classTeacherId}`);
    }
    // Remove all classTeacherId related keys from the mutable copy before iterating
    delete mutableUpdateData['classTeacherId._id'];
    delete mutableUpdateData['classTeacherId.name'];
    delete mutableUpdateData['classTeacherId.email'];


    // If password provided, hash it and set safely
    if (typeof mutableUpdateData.password === 'string' && mutableUpdateData.password.trim().length > 0) {
        if (mutableUpdateData.password.trim().length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        const hashed = await bcrypt.hash(mutableUpdateData.password.trim(), 10);
        studentUpdate.password = hashed;
        delete mutableUpdateData.password;
    }

    // Iterate through the remaining keys in the mutable updateData
    for (const key of Object.keys(mutableUpdateData)) {
        const value = mutableUpdateData[key];

        // *** Skip _id and parentId._id fields ***
        if (key === '_id' || key.startsWith('parentId._id')) {
            console.log(`Skipping restricted key: ${key}`);
            continue;
        }
        // ***************************************

        // *** Add check for empty string values ***
        if (value === '') {
            console.log(`Skipping empty value for key: ${key}`);
            continue; // Skip updating with empty strings
        }
        // ****************************************

        // Check if the key belongs to parentData
        if (key.startsWith('parentData.')) {
                // Add to parentUpdate using the original flattened key
                parentUpdate[key] = value;
            } else {
                // Add to studentUpdate
                studentUpdate[key] = value;
            }
        }
    console.log('Prepared studentUpdate object:', studentUpdate);
    console.log('Prepared parentUpdate object:', parentUpdate);


    // Handle photo updates from req.files
    if (files) {
      console.log('Processing file uploads:', files); // Log file processing
      if (files['profilePhoto'] && files['profilePhoto'][0]) {
        const filePath = files['profilePhoto'][0].path;
        studentUpdate.profilePhoto = filePath;
        console.log('New profile photo path:', filePath);
        // Delete old profile photo if exists
        if (existingStudent.profilePhoto && fs.existsSync(existingStudent.profilePhoto)) {
          console.log('Attempting to delete old profile photo:', existingStudent.profilePhoto); // Log file deletion attempt
          try {
            fs.unlinkSync(existingStudent.profilePhoto);
            console.log('Old profile photo deleted successfully.');
          } catch (err) {
            console.error('Error deleting old student photo:', err); // Log file deletion error
          }
        }
      }

      if (files['fatherPhoto'] && files['fatherPhoto'][0]) {
        const filePath = files['fatherPhoto'][0].path;
        parentUpdate['parentData.father.photo'] = filePath; // Use dot notation for parent photo
        console.log('New father photo path:', filePath);
        // Delete old father photo if exists
        if (existingParent.father?.photo && fs.existsSync(existingParent.father.photo)) {
           console.log('Attempting to delete old father photo:', existingParent.father.photo); // Log file deletion attempt
          try {
            fs.unlinkSync(existingParent.father.photo);
            console.log('Old father photo deleted successfully.');
          } catch (err) {
            console.error('Error deleting old father photo:', err); // Log file deletion error
          }
        }
      }

      if (files['motherPhoto'] && files['motherPhoto'][0]) {
         const filePath = files['motherPhoto'][0].path;
        parentUpdate['parentData.mother.photo'] = filePath; // Use dot notation for parent photo
        console.log('New mother photo path:', filePath);
        // Delete old mother photo if exists
        if (existingParent.mother?.photo && fs.existsSync(existingParent.mother.photo)) {
           console.log('Attempting to delete old mother photo:', existingParent.mother.photo); // Log file deletion attempt
          try {
            fs.unlinkSync(existingParent.mother.photo);
            console.log('Old mother photo deleted successfully.');
          } catch (err) {
            console.error('Error deleting old mother photo:', err); // Log file deletion error
          }
          }
      }

      if (files['guardianPhoto'] && files['guardianPhoto'][0]) {
         const filePath = files['guardianPhoto'][0].path;
        parentUpdate['parentData.guardian.photo'] = filePath; // Use dot notation for parent photo
        console.log('New guardian photo path:', filePath);
        // Delete old guardian photo if exists
        if (existingParent.guardian?.photo && fs.existsSync(existingParent.guardian.photo)) {
           console.log('Attempting to delete old guardian photo:', existingParent.guardian.photo); // Log file deletion attempt
          try {
            fs.unlinkSync(existingParent.guardian.photo);
            console.log('Old guardian photo deleted successfully.');
          } catch (err) {
            console.error('Error deleting old guardian photo:', err); // Log file deletion error
          }
        }
      }
    }
    console.log('Finished processing file uploads.');


    console.log('Attempting to update student document:', studentId, studentUpdate); // Log before student update
    let updatedStudent;
    try {
        // Update the student
        updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            studentUpdate, // Use student update object with flattened keys
            { new: true, runValidators: true }
        );
        console.log('Student document updated successfully.'); // Log after student update
    } catch (studentUpdateError) {
        console.error('Error updating student document:', studentUpdateError);
        throw studentUpdateError; // Re-throw to be caught by the main catch block
    }


    console.log('Attempting to update parent document:', existingParent._id, parentUpdate); // Log before parent update
    let updatedParent;
    try {
        // Update the parent
        // Mongoose can update nested fields using dot notation directly in the update object
        updatedParent = await Parent.findByIdAndUpdate(
            existingParent._id,
            parentUpdate, // Use parent update object with flattened keys (including parentData. prefix)
            { new: true, runValidators: true }
        );
        console.log('Parent document updated successfully.'); // Log after parent update
    } catch (parentUpdateError) {
        console.error('Error updating parent document:', parentUpdateError);
        throw parentUpdateError; // Re-throw
    }


    // Fee assignment is now handled explicitly by staff in StudentFeeManagement.
    // No automatic re-assignment during student update.

    res.status(200).json({
      message: 'Student and Parent updated successfully',
      student: updatedStudent,
      parent: updatedParent
    });

  } catch (error) {
    console.error('Update Student Error:', error); // Keep this general error log
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      console.error('Validation failed:', errors); // Log validation errors
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Update parent data (This function exists but is not called by the /update/:studentId route)
const updateParent = async (req, res) => {
  const { parentId } = req.params;
  let updatedData = req.body;

  if (!parentId) return res.status(400).json({ message: 'Parent ID is required' });

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Handle uploaded photos (This part is relevant if this function were called directly with file uploads)
    if (req.files) {
      if (req.files.fatherPhoto?.[0]) {
        updatedData.father = updatedData.father || {};
        updatedData.father.photo = req.files.fatherPhoto[0].path;

        // Optional: delete old image
        if (parent.father?.photo && fs.existsSync(parent.father.photo)) {
          fs.unlink(parent.father.photo, (err) => {
            if (err) console.error('Error deleting old father photo:', err);
          });
        }
      }

      if (req.files.motherPhoto?.[0]) {
        updatedData.mother = updatedData.mother || {};
        updatedData.mother.photo = req.files.motherPhoto[0].path;

        if (parent.mother?.photo && fs.existsSync(parent.mother.photo)) {
          fs.unlink(parent.mother.photo, (err) => {
            if (err) console.error('Error deleting old mother photo:', err);
          });
        }
      }

      if (req.files.guardianPhoto?.[0]) {
        updatedData.guardian = updatedData.guardian || {};
        updatedData.guardian.photo = req.files.guardianPhoto[0].path;

        if (parent.guardian?.photo && fs.existsSync(parent.guardian.photo)) {
          fs.unlink(parent.guardian.photo, (err) => {
            if (err) console.error('Error deleting old guardian photo:', err);
          });
        }
      }
    }

    const updatedParent = await Parent.findByIdAndUpdate(parentId, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      message: 'Parent updated successfully',
      parent: updatedParent
    });

  } catch (error) {
    console.error('Update Parent Error:', error);
    res.status(500).json({ message: 'Error updating parent', error: error.message });
  }
};



// Student login
const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const student = await Student.findOne({ email }).select('+password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: student._id, role: student.role, schoolId: student.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        schoolId: student.schoolId
      }
    });
  } catch (error) {
    console.error('Student Login Error:', error);
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

// Get all students for a specific school
const getAllStudents = async (req, res) => {
  const { schoolId } = req.params;
  const { classId } = req.query; // Get classId from query parameters

  if (!schoolId) {
    return res.status(400).json({ message: 'School ID is required' });
  }

  try {
    // Build query object
    const query = { schoolId };
    if (classId) {
      query.classId = classId; // Add classId to query if provided
    }

    // Fetch students based on the query
    const students = await Student.find(query)
      .populate('parentId')
      .populate('classTeacherId', 'name email')
      .populate('classId', 'className')
      .populate('sectionId'); // Populate classId and select className

    if (!students || students.length === 0) {
      // Return 200 with empty array if no students found for the criteria
      return res.status(200).json({ message: 'No students found for this school or class', students: [] });
    }

    res.status(200).json({
      message: 'Students retrieved successfully',
      students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students by class teacher for a specific school
const getStudentsByClassTeacher = async (req, res) => {
  const { teacherId } = req.params; // Get teacherId from URL parameters
  const schoolIdParam = req.query.schoolId || req.header('School-ID') || req.decodedToken?.schoolId; // Allow query, header, or token

  // Validate presence
  if (!schoolIdParam || !teacherId) {
    return res.status(400).json({ message: 'School ID and Teacher ID are required' });
  }

  // Validate ObjectId formats to avoid CastError
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));
  if (!isValidObjectId(teacherId) || !isValidObjectId(schoolIdParam)) {
    return res.status(400).json({ message: 'Invalid School ID or Teacher ID format' });
  }

  try {
    // Fetch all students for the given class teacher (teacherId) and schoolId
    const students = await Student.find({ schoolId: schoolIdParam, classTeacherId: teacherId })
      .populate('parentId')
      .populate('classTeacherId', 'name email')
      .populate('sectionId');

    if (!students || students.length === 0) {
      return res.status(200).json({ message: 'No students found for this class teacher in the given school', students: [] });
    }

    res.status(200).json({
      message: 'Students retrieved successfully for the class teacher',
      students
    });
  } catch (error) {
    console.error('Error fetching students by class teacher:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // Find the student to get parentId and profilePhoto path
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the parent and remove the student from children array
    const parent = await Parent.findById(student.parentId);

    if (parent) {
      parent.children = parent.children.filter(
        (childId) => childId.toString() !== studentId
      );
      await parent.save();
    }

    // Delete the student document
    await Student.findByIdAndDelete(studentId);

    // Delete profile photo file if it exists
    if (student.profilePhoto && fs.existsSync(student.profilePhoto)) {
      fs.unlink(student.profilePhoto, (err) => {
        if (err) console.error('Error deleting student photo file:', err);
      });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students by query parameters (for marksheet creation)
const getStudentsByQuery = async (req, res) => {
  const { classId, section, academicYear, teacherId } = req.query;
  const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.headers['school-id']; // Also check headers for schoolId
  
  console.log('Backend: getStudentsByQuery received:', { classId, section, academicYear, teacherId, schoolIdFromToken: schoolId });

  if (!schoolId) {
    console.log('Backend: School ID not found in token or headers for getStudentsByQuery');
    return res.status(400).json({ message: 'School ID not found in token or headers' });
  }

  try {
    const query = { schoolId };
    
    if (classId) query.classId = classId;
    if (academicYear) query.academicYear = academicYear;
    if (teacherId) {
      query.classTeacherId = teacherId;
      console.log(`Backend: Filtering students by classTeacherId: ${teacherId}`);
    }
    
    if (section) {
      console.log(`Backend: Attempting to find section: { name: "${section}", schoolId: "${schoolId}" }`);
      // First try to find section by name and schoolId
      let sectionDoc = await Section.findOne({ name: section, schoolId });
      console.log('Backend: Section.findOne result:', sectionDoc);
      
      // If not found and classId is provided, also filter by classId
      if (!sectionDoc && classId) {
        console.log(`Backend: Trying to find section with classId filter: { name: "${section}", schoolId: "${schoolId}", classId: "${classId}" }`);
        sectionDoc = await Section.findOne({ name: section, schoolId, classId });
        console.log('Backend: Section.findOne with classId result:', sectionDoc);
      }
      
      // If still not found, try case-insensitive search
      if (!sectionDoc) {
        console.log(`Backend: Trying case-insensitive search for section: "${section}"`);
        sectionDoc = await Section.findOne({ 
          name: { $regex: new RegExp(`^${section}$`, 'i') }, 
          schoolId,
          ...(classId && { classId })
        });
        console.log('Backend: Case-insensitive section search result:', sectionDoc);
      }
      
      // Build section filter using $and to combine with other filters
      const sectionFilters = [];
      if (sectionDoc) {
        sectionFilters.push(
          { sectionId: sectionDoc._id },
          { sectionName: section },
          { sectionName: { $regex: new RegExp(`^${section}$`, 'i') } },
          { section: section },
          { section: { $regex: new RegExp(`^${section}$`, 'i') } }
        );
        console.log(`Backend: Using multiple section filters: sectionId=${sectionDoc._id}, sectionName="${section}", section="${section}"`);
      } else {
        console.log(`Backend: No section document found, trying direct section field matching`);
        sectionFilters.push(
          { sectionName: section },
          { sectionName: { $regex: new RegExp(`^${section}$`, 'i') } },
          { section: section },
          { section: { $regex: new RegExp(`^${section}$`, 'i') } }
        );
        console.log(`Backend: Using direct section field filters for: "${section}"`);
        
        // Debug: List all sections for this school and class
        const allSections = await Section.find({ schoolId, ...(classId && { classId }) });
        console.log('Backend: All available sections:', allSections.map(s => ({ _id: s._id, name: s.name, classId: s.classId })));
      }
      
      // Combine existing query with section filters using $and
      query.$and = [
        { $or: sectionFilters }
      ];
    }

    console.log('Backend: Constructed student query:', JSON.stringify(query));
    const students = await Student.find(query)
      .populate('parentId')
      .populate('classTeacherId', 'name email')
      .populate('classId', 'className')
      .populate('sectionId');

    console.log(`Backend: Found ${students.length} students for query:`, JSON.stringify(query));
    
    // Debug: If no students found, let's check what students exist for this class
    if (students.length === 0 && classId) {
      console.log('Backend: No students found, checking all students for this class...');
      const allClassStudents = await Student.find({ schoolId, classId })
        .populate('sectionId', 'name')
        .select('name sectionId');
      console.log('Backend: All students in this class:', allClassStudents.map(s => ({ 
        name: s.name, 
        sectionId: s.sectionId?._id, 
        sectionName: s.sectionId?.name 
      })));
    }

    res.status(200).json({ 
      success: true,
      data: students 
    });
  } catch (error) {
    console.error('Error fetching students by query:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  updateParent,
  studentLogin,
  getStudentsByClassTeacher,
  getStudentById,
  deleteStudent, // Export the new function
  getStudentsByQuery
};
