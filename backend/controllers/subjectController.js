const Subject = require('../models/Subject');
const Class = require('../models/classModel'); // Import Class model
const subjectCatalog = require('../utils/subjectCatalog');

// Create Subject
exports.createSubject = async (req, res) => {
  try {
    const { name, code, classId, sectionId } = req.body;

    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.body.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    const subject = new Subject({ name, code, classId, sectionId, schoolId });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Subjects (by classId or schoolId)
exports.getSubjects = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.query.schoolId || req.headers['school-id']; // Also check headers for schoolId

    console.log('Backend: getSubjects received:', { classId, sectionId, schoolIdFromToken: schoolId });

    if (!schoolId) {
      console.log('Backend: School ID missing in token, user, query, or headers for getSubjects');
      return res.status(400).json({ message: 'School ID missing' });
    }

    const filter = { schoolId };
    if (classId) {
      filter.classId = classId;
      console.log(`Backend: Filtering subjects by classId: ${classId}`);
    }
    if (sectionId) {
      filter.sectionId = sectionId;
      console.log(`Backend: Filtering subjects by sectionId: ${sectionId}`);
    }

    console.log('Backend: Final subject filter:', JSON.stringify(filter));
    const subjects = await Subject.find(filter).lean();
    console.log(`Backend: Found ${subjects.length} subjects for filter:`, JSON.stringify(filter));

    res.json({ success: true, data: subjects }); // Wrap subjects in a data object for consistency
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update Subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const subject = await Subject.findByIdAndUpdate(id, { name, code }, { new: true });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Subjects by Class and Section
exports.deleteSubjectsByClassAndSection = async (req, res) => {
  try {
    const { classId, sectionId } = req.body; // Assuming classId and sectionId are sent in the body for a DELETE request
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.headers['school-id'];

    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required to delete subjects by class and section' });
    }

    let filter = { schoolId, classId };

    // Only add sectionId to the filter if it's provided and not an empty string
    if (sectionId && sectionId !== '') {
      filter.sectionId = sectionId;
    }
    // If sectionId is not provided or is an empty string, we don't add it to the filter,
    // meaning subjects for all sections (or no section) of that classId will be deleted.

    console.log('Backend: deleteSubjectsByClassAndSection - Received req.body:', req.body);
    console.log('Backend: deleteSubjectsByClassAndSection - Derived schoolId:', schoolId);
    console.log('Backend: deleteSubjectsByClassAndSection - Deleting subjects with filter:', JSON.stringify(filter));
    const result = await Subject.deleteMany(filter);
    console.log('Backend: deleteSubjectsByClassAndSection - Delete result:', result);
    res.json({ message: `${result.deletedCount} subjects deleted successfully`, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting subjects by class and section:', err);
    res.status(500).json({ message: err.message });
  }
};

// Static catalog of subjects with codes
exports.getSubjectCatalog = async (req, res) => {
  try {
    res.json(subjectCatalog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk seed subjects for a given class using the catalog
exports.seedSubjectsForClass = async (req, res) => {
  try {
    const { classId, sectionId } = req.body;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.body.schoolId;

    if (!schoolId || !classId) {
      return res.status(400).json({ message: 'schoolId and classId are required' });
    }

    const created = [];
    for (const item of subjectCatalog) {
      const existing = await Subject.findOne({ schoolId, classId, sectionId: sectionId || null, name: item.name });
      if (!existing) {
        const doc = await Subject.create({ name: item.name, code: item.code, classId, sectionId, schoolId });
        created.push(doc);
      }
    }

    res.json({ createdCount: created.length, created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
