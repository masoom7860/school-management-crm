const jwt = require('jsonwebtoken');
const School = require('../models/registarSchoolModel');
const Student = require('../models/studentModel');
const Parent = require('../models/parentModel');
const Staff = require('../models/staffModel');
const Teacher = require('../models/teacherModel');
const Subadmin = require('../models/subAdmin');


exports.verifySchoolAdmin = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }

        const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');

        if (decoded.role !== 'admin') { // Assuming 'admin' is the role for School Admin
             return res.status(403).json({ success: false, message: 'Access denied, requires School Admin role' });
        }

        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        req.school = school; // Attach school data to request
        req.user = decoded; // Attach decoded token info (including role, id, schoolId)
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

exports.verifyStaff = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');

        if (decoded.role !== 'staff') {
             return res.status(403).json({ success: false, message: 'Access denied, requires Staff role' });
        }

        const user = await Staff.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Staff user not found' });
        }

        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found for this user' });
        }

        req.user = user; // Attach Staff user data
        req.school = school; // Attach school data
        req.decodedToken = decoded; // Attach decoded token info
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

exports.verifyAdminOrSubadmin = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');

        if (decoded.role !== 'admin' && decoded.role !== 'subadmin') {
             return res.status(403).json({ success: false, message: 'Access denied, requires Admin or Subadmin role' });
        }

        let Model;
        switch (decoded.role) {
            case 'admin': Model = School; break; // Assuming School Admin is represented by School model or similar
            case 'subadmin': Model = Subadmin; break;
            default: return res.status(403).json({ success: false, message: 'Invalid role in token' });
        }

        // For Admin, we just need the school. For Subadmin, we need the user.
        let user = null;
        if (decoded.role === 'subadmin') {
             user = await Model.findById(decoded.id);
             if (!user) {
                 return res.status(404).json({ success: false, message: `${decoded.role} user not found` });
             }
        }


        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found for this user' });
        }

        req.user = user || decoded; // Attach user data (Subadmin model or decoded token for Admin)
        req.school = school; // Attach school data
        req.decodedToken = decoded; // Attach decoded token info
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

exports.verifyAdminOrStaff = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');

        if (decoded.role !== 'admin' && decoded.role !== 'staff' && decoded.role !== 'subadmin') {
             return res.status(403).json({ success: false, message: 'Access denied, requires Admin, Staff, or Subadmin role' });
        }

        let Model;
        switch (decoded.role) {
            case 'admin': Model = School; break; // Assuming School Admin is represented by School model or similar
            case 'staff': Model = Staff; break;
            case 'subadmin': Model = Subadmin; break;
            default: return res.status(403).json({ success: false, message: 'Invalid role in token' });
        }

         // For Admin, we just need the school. For Staff and Subadmin, we need the user.
        let user = null;
        if (decoded.role === 'staff' || decoded.role === 'subadmin') {
             user = await Model.findById(decoded.id);
             if (!user) {
                 return res.status(404).json({ success: false, message: `${decoded.role} user not found` });
             }
        }


        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found for this user' });
        }

        req.user = user || decoded; // Attach user data (Staff model or decoded token for Admin)
        req.school = school; // Attach school data
        req.decodedToken = decoded; // Attach decoded token info
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

exports.verifyTeacher = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');

        if (decoded.role !== 'teacher') {
             return res.status(403).json({ success: false, message: 'Access denied, requires Teacher role' });
        }

        const user = await Teacher.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Teacher user not found' });
        }

        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found for this user' });
        }

        req.user = user; // Attach Teacher user data
        req.school = school; // Attach school data
        req.decodedToken = decoded; // Attach decoded token info
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

exports.allowRoles = (...roles) => async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied, token missing or invalid' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');
        
        if (!roles.includes(decoded.role)) {
            return res.status(403).json({ success: false, message: `Access denied, requires one of: ${roles.join(', ')}` });
        }

        // Fetch user data based on role
        let user = null;
        let Model;
        
        switch (decoded.role) {
            case 'admin': 
                Model = School; 
                break;
            case 'teacher': 
                Model = Teacher; 
                break;
            case 'staff': 
                Model = Staff; 
                break;
            case 'subadmin': 
                Model = Subadmin; 
                break;
            case 'student':
                Model = Student;
                break;
            case 'parent':
                Model = Parent;
                break;
            default: 
                return res.status(403).json({ success: false, message: 'Invalid role in token' });
        }

        // For Admin, we just need the school. For others, we need the user.
        if (decoded.role === 'admin') {
            user = await Model.findById(decoded.schoolId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'School not found' });
            }
        } else {
            user = await Model.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ success: false, message: `${decoded.role} user not found` });
            }
        }

        // Fetch school data
        const school = await School.findById(decoded.schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found for this user' });
        }

        req.user = user; // Attach user data
        req.school = school; // Attach school data
        req.decodedToken = decoded; // Attach decoded token info
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message.includes('jwt') ? 'Invalid or expired token' : 'Authorization error'
        });
    }
};

// All middlewares are already exported via `exports.functionName = ...`
// No need for a separate export block here.
