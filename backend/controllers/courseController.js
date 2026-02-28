const Course = require('../models/courseModel');

// ✅ Add Course
const addCourse = async (req, res) => {
  const { title, code, description, class: className, sectionId, duration, schedule, teacherId, schoolId, createdBy } = req.body;

  try {
    const course = new Course({
      title,
      code,
      description,
      class: className,
      sectionId,
      duration,
      schedule,
      teacherId,
      schoolId,
      createdBy
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// ✅ Get All Courses by School ID
const getCoursesBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const courses = await Course.find({ schoolId }).populate('teacherId', 'name email').populate('sectionId');
    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// ✅ Get Single Course
const getCourseById = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId).populate('teacherId', 'name email').populate('sectionId');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const { schoolId } = req.body; // Or get it from req.user if using auth middleware
    const updates = req.body;
  
    try {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
  
      if (course.schoolId.toString() !== schoolId) {
        return res.status(403).json({ message: 'Unauthorized to update this course' });
      }
  
      const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, { new: true });
      res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error: error.message });
    }
  };
  

  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    const { schoolId } = req.body; // Or from token
  
    try {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
  
      if (course.schoolId.toString() !== schoolId) {
        return res.status(403).json({ message: 'Unauthorized to delete this course' });
      }
  
      await Course.findByIdAndDelete(courseId);
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
  };
  
  
module.exports = {
  addCourse,
  getCoursesBySchool,
  getCourseById,
  updateCourse,
  deleteCourse
};
