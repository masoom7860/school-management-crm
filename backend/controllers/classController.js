const Class = require('../models/classModel');
const Section = require('../models/section');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');

// ➕ Add Class
const addClass = async (req, res) => {
  try {
    const { className } = req.body;
    const schoolId = req.decodedToken.schoolId;
    const createdBy = req.user ? req.user._id : null;
    const existingClass = await Class.findOne({ className, schoolId });
    if (existingClass) {
      return res.status(400).json({ message: 'A class with this name already exists for this school.' });
    }
    const newClass = new Class({
      className,
      schoolId,
      createdBy
    });
    await newClass.save();
    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

// 👩‍🏫 Get classes assigned to the logged-in teacher
const getTeacherAssignedClasses = async (req, res) => {
  try {
    const decoded = req.decodedToken;
    if (!decoded || decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Teacher access only' });
    }
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const schoolId = decoded.schoolId;
    const classIds = (teacher.classesAssigned || []).map(id => String(id));
    if (!classIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }
    const classes = await Class.find({ _id: { $in: classIds }, schoolId });
    return res.status(200).json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching teacher assigned classes:', error);
    return res.status(500).json({ success: false, message: 'Error fetching assigned classes', error: error.message });
  }
};

// 👩‍🏫 Get classes with sections assigned to the logged-in teacher
const getTeacherAssignedClassesWithSections = async (req, res) => {
  try {
    const decoded = req.decodedToken;
    if (!decoded || decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Teacher access only' });
    }
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const schoolId = decoded.schoolId;
    const classIds = (teacher.classesAssigned || []).map(id => String(id));
    if (!classIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }
    const classes = await Class.find({ _id: { $in: classIds }, schoolId });
    const classesWithSections = await Promise.all(
      classes.map(async (cls) => {
        const sections = await Section.find({ classId: cls._id, schoolId });
        return { ...cls.toObject(), sections };
      })
    );
    return res.status(200).json({ success: true, data: classesWithSections });
  } catch (error) {
    console.error('Error fetching teacher assigned classes with sections:', error);
    return res.status(500).json({ success: false, message: 'Error fetching assigned classes with sections', error: error.message });
  }
};

// 📥 Get All Classes for a School
const getClassesBySchool = async (req, res) => {
  try {
    const schoolId = req.decodedToken.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID not found in token' });
    }
    console.log(`Fetching classes for schoolId: ${schoolId}`);
    const classes = await Class.find({ schoolId });
    console.log(`Found ${classes.length} classes.`);
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// 📄 Get Single Class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params; 
    const schoolId = req.decodedToken.schoolId;

    const classData = await Class.findOne({ _id: id, schoolId }); 
    if (!classData) return res.status(404).json({ message: 'Class not found for this school' });

    res.status(200).json({ class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class', error: error.message });
  }
};

// ✏️ Update Class (Only by same school)
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken.schoolId;
    const updates = req.body;
    if (updates.schoolId) {
      return res.status(400).json({ message: 'Cannot change schoolId of an existing class' });
    }
    const updated = await Class.findOneAndUpdate(
      { _id: id, schoolId: schoolId },
      updates,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Class not found or does not belong to your school' });
    }
    res.status(200).json({ message: 'Class updated successfully', class: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating class', error: error.message });
  }
};

// ❌ Delete Class (Only by same school)
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken.schoolId;

    // Find and delete the class, ensuring it belongs to the school
    const deletedClass = await Class.findOneAndDelete({ _id: id, schoolId: schoolId }); // Filter by ID and schoolId

    if (!deletedClass) {
        return res.status(404).json({ message: 'Class not found or does not belong to your school' });
    }

    // Delete all sections belonging to this class
    await Section.deleteMany({ classId: id, schoolId });

    res.status(200).json({ message: 'Class and its sections deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
};

// Add Section to Class
const addSectionToClass = async (req, res) => {
  try {
    const { id } = req.params; // classId
    const { name } = req.body;
    const schoolId = req.decodedToken.schoolId;
    if (!name) return res.status(400).json({ message: 'Section name is required' });
    
    // Check for duplicate section name in the same class
    const existingSection = await Section.findOne({ classId: id, name, schoolId });
    if (existingSection) {
        return res.status(400).json({ message: `Section "${name}" already exists in this class.` });
    }
    
    const section = await Section.create({ name, classId: id, schoolId });
    res.status(201).json({ message: 'Section added', section });
  } catch (error) {
    res.status(500).json({ message: 'Error adding section', error: error.message });
  }
};

// Update Section in Class
const updateSectionInClass = async (req, res) => {
  try {
    const { id, sectionName } = req.params; // classId, sectionName (old name)
    const { name } = req.body; // new name
    const schoolId = req.decodedToken.schoolId;
    
    // Check if the new name is already taken by another section in the same class
    if (name) {
        const duplicate = await Section.findOne({ 
            classId: id, 
            name: name, 
            schoolId, 
            name: { $ne: sectionName } // Exclude the current section from the check
        });
        if (duplicate) {
            return res.status(400).json({ message: `Section with name "${name}" already exists in this class.` });
        }
    }

    // Find and update the section using the old name
    const section = await Section.findOneAndUpdate(
      { classId: id, name: sectionName, schoolId },
      { name },
      { new: true }
    );
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.status(200).json({ message: 'Section updated', section });
  } catch (error) {
    res.status(500).json({ message: 'Error updating section', error: error.message });
  }
};

// Delete Section from Class
const deleteSectionFromClass = async (req, res) => {
  try {
    const { id, sectionName } = req.params; // classId, sectionName
    const schoolId = req.decodedToken.schoolId;
    const section = await Section.findOneAndDelete({ classId: id, name: sectionName, schoolId });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.status(200).json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error: error.message });
  }
};

// 📄 Get All Sections for a Specific Class
const getSectionsByClass = async (req, res) => {
  try {
    const { classId } = req.query; // Read from query parameters
    const decoded = req.decodedToken;
    const schoolId = decoded.schoolId;

    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    // If teacher, ensure the classId is assigned to this teacher and prefer sections where teacher is class teacher
    if (decoded?.role === 'teacher') {
      const teacher = await Teacher.findById(decoded.id);
      const assigned = (teacher?.classesAssigned || []).map(id => String(id));
      if (!assigned.includes(String(classId))) {
        return res.status(403).json({ success: false, message: 'Not permitted for this class' });
      }
      // Find sections where this teacher is the class teacher for any student
      const sectionIds = await Student.distinct('sectionId', { schoolId, classId, classTeacherId: decoded.id, sectionId: { $ne: null } });
      if (Array.isArray(sectionIds) && sectionIds.length) {
        const sections = await Section.find({ _id: { $in: sectionIds }, classId, schoolId });
        return res.status(200).json({ success: true, sections: sections || [] });
      }
    }

    const sections = await Section.find({ classId: classId, schoolId });
    return res.status(200).json({ success: true, sections: sections || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections by class', error: error.message });
  }
};


// Get All Classes with their sections for a School
const getClassesWithSections = async (req, res) => {
  try {
    const schoolId = req.decodedToken.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID not found in token' });
    }

    const classes = await Class.find({ schoolId });
    const classesWithSections = await Promise.all(
      classes.map(async (cls) => {
        try {
          const sections = await Section.find({ classId: cls._id, schoolId });
          return {
            ...cls.toObject(),
            sections: sections
          };
        } catch (error) {
          console.error(`Error fetching sections for class ${cls.className}:`, error);
          return {
            ...cls.toObject(),
            sections: []
          };
        }
      })
    );

    res.status(200).json({ success: true, data: classesWithSections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes with sections', error: error.message });
  }
};

// 📘 Get Students by Class and Section
const getStudentsByClassAndSection = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const schoolId = req.decodedToken.schoolId;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID not found in token" });
    }
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    // Build filter condition dynamically
    const filter = { classId, schoolId };
    if (sectionId && sectionId !== 'null' && sectionId !== 'undefined') filter.sectionId = sectionId;

    // Fetch students
    const students = await Student.find(filter)
      .populate("classId", "className")
      .populate("sectionId", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students by class and section:", error);
    res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};


module.exports = {
  addClass,
  getClassesBySchool,
  getClassById,
  updateClass,
  deleteClass,
  addSectionToClass,
  updateSectionInClass,
  deleteSectionFromClass,
  getSectionsByClass, // <-- This is the function that was missing
  getClassesWithSections,
  getStudentsByClassAndSection, // ✅ added
  getTeacherAssignedClasses,
  getTeacherAssignedClassesWithSections,
};
