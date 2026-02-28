const School = require('../models/registarSchoolModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Otp = require('../models/otp');
const { verifyOtp } = require('../controllers/otpController');  // Importing verifyOtp
const mongoose = require('mongoose'); // Import mongoose for transactions
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const Staff = require('../models/staffModel');


const registerSchool = async (req, res) => {
  const {
    email, otp,
    schoolName, address, city, state, country, postalCode,
    phone, alternatePhone, website, establishmentYear, affiliation, schoolCode,
    principalName, gstNumber, panNumber, licenseNumber,
    accountHolderName, bankName, accountNumber, ifscCode, upiId,
    adminName, adminEmail, adminPassword, identityType, identityNumber,
    subscriptionPlanId
  } = req.body;

  // Handle empty string for optional enum field
  const processedIdentityType = identityType === '' ? undefined : identityType;
  const processedSchoolCode = (schoolCode === '' || schoolCode == null) ? undefined : schoolCode;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ 1. Verify OTP
    const otpVerification = await verifyOtp({ email, otp });
    if (!otpVerification.valid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: otpVerification.message });
    }

    // ✅ 2. Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // ✅ 3. Create admin (not saved yet)
    const admin = new Admin({ name: adminName, email: adminEmail, password: hashedPassword });

    // ✅ Get file paths from req.files
    const logoPath = req.files && req.files['logoUrl'] ? req.files['logoUrl'][0].path : undefined;
    const identityDocumentPath = req.files && req.files['identityDocumentUrl'] ? req.files['identityDocumentUrl'][0].path : undefined;
    const registrationCertificatePath = req.files && req.files['registrationCertificateUrl'] ? req.files['registrationCertificateUrl'][0].path : undefined;


    // ✅ 4. Create school with admin ref and file paths
    const school = new School({
      schoolName, address, city, state, country, postalCode,
      email, phone, alternatePhone, website, establishmentYear, affiliation, schoolCode: processedSchoolCode,
      logoUrl: logoPath, // Use the file path from Multer
      principalName,
      businessDetails: {
        gstNumber, panNumber, licenseNumber,
        registrationCertificateUrl: registrationCertificatePath, // Use the file path from Multer
        accountHolderName, bankName, accountNumber, ifscCode, upiId
      },
      adminDetails: {
        fullName: adminName,
        email: adminEmail,
        phone,
        role: 'Admin',
        identityType: processedIdentityType, // Use the processed value
        identityNumber,
        identityDocumentUrl: identityDocumentPath // Use the file path from Multer
      },
      admin: admin._id,
      subscription: {
        plan: subscriptionPlanId || null,
        paymentStatus: 'Pending'
      }
    });

    // ✅ Save both in transaction
    await admin.save({ session });
    await school.save({ session });

    // ✅ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // ✅ 5. Clean up OTP (outside transaction)
    await Otp.deleteMany({ email });

    return res.status(201).json({
      message: 'School and Admin registered successfully',
      schoolId: school._id,
      schoolName: school.schoolName,
      logoUrl: school.logoUrl,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle duplicate key errors gracefully
    if (error && error.code === 11000) {
      const dupField = Object.keys(error.keyPattern || error.keyValue || {})[0];
      let details = 'Duplicate value';
      if (dupField === 'schoolName') details = 'School name already exists. Please choose a different name or add a branch identifier.';
      if (dupField === 'email') details = 'Email already exists. Please use a different email address.';
      if (dupField === 'phone') details = 'Phone number already exists. Please use a different phone number.';
      if (dupField === 'schoolCode') details = 'School code already exists. Please use a different code.';
      return res.status(409).json({
        error: 'Duplicate key',
        field: dupField,
        details
      });
    }

    return res.status(500).json({
      error: 'School registration failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : {} // Optionally include stack in dev
    });
  }
};

const updateSchool = async (req, res) => {
  const { schoolId } = req.params;
  const {
    schoolName, address, city, state, country, postalCode,
    phone, alternatePhone, website, establishmentYear, affiliation, schoolCode,
    principalName, gstNumber, panNumber, licenseNumber, registrationCertificateUrl,
    accountHolderName, bankName, accountNumber, ifscCode, upiId,
    adminName, adminEmail, identityType, identityNumber, identityDocumentUrl,
    subscriptionPlanId, paymentStatus,
    adminPassword // Include adminPassword in destructuring
  } = req.body;

  // Start a Mongoose session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const school = await School.findById(schoolId).session(session); // Pass session
    if (!school) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'School not found' });
    }

    // Find the associated Admin document
    const admin = await Admin.findById(school.admin).session(session); // Pass session
    if (!admin) {
       await session.abortTransaction();
       session.endSession();
       return res.status(404).json({ error: 'Associated admin not found' });
    }


    // ✅ Basic info (School)
    if (schoolName !== undefined) school.schoolName = schoolName;
    if (address !== undefined) school.address = address;
    if (city !== undefined) school.city = city;
    if (state !== undefined) school.state = state;
    if (country !== undefined) school.country = country;
    if (postalCode !== undefined) school.postalCode = postalCode;
    if (phone !== undefined) school.phone = phone;
    if (alternatePhone !== undefined) school.alternatePhone = alternatePhone;
    if (website !== undefined) school.website = website;
    if (establishmentYear !== undefined) school.establishmentYear = establishmentYear;
    if (affiliation !== undefined) school.affiliation = affiliation;
    if (schoolCode !== undefined) school.schoolCode = schoolCode;
    if (principalName !== undefined) school.principalName = principalName;

    // ✅ Handle uploaded files (School)
    if (req.files) {
      if (req.files['logoUrl']) {
        school.logoUrl = req.files['logoUrl'][0].path;
      }
      if (req.files['registrationCertificateUrl']) {
        if (!school.businessDetails) school.businessDetails = {};
        school.businessDetails.registrationCertificateUrl = req.files['registrationCertificateUrl'][0].path;
      }
      if (req.files['identityDocumentUrl']) {
         if (!school.adminDetails) school.adminDetails = {};
        school.adminDetails.identityDocumentUrl = req.files['identityDocumentUrl'][0].path;
      }
    }


    // ✅ Business Details (School)
    if (!school.businessDetails) school.businessDetails = {};
    if (gstNumber !== undefined) school.businessDetails.gstNumber = gstNumber;
    if (panNumber !== undefined) school.businessDetails.panNumber = panNumber;
    if (licenseNumber !== undefined) school.businessDetails.licenseNumber = licenseNumber;
    if (registrationCertificateUrl !== undefined) school.businessDetails.registrationCertificateUrl = registrationCertificateUrl;
    if (accountHolderName !== undefined) school.businessDetails.accountHolderName = accountHolderName;
    if (bankName !== undefined) school.businessDetails.bankName = bankName;
    if (accountNumber !== undefined) school.businessDetails.accountNumber = accountNumber;
    if (ifscCode !== undefined) school.businessDetails.ifscCode = ifscCode;
    if (upiId !== undefined) school.businessDetails.upiId = upiId;

    // ✅ Admin Details (School - for display/record keeping on school doc)
    if (!school.adminDetails) school.adminDetails = {};
    if (adminName !== undefined) school.adminDetails.fullName = adminName;
    if (adminEmail !== undefined) school.adminDetails.email = adminEmail;
    if (identityType !== undefined) school.adminDetails.identityType = identityType;
    if (identityNumber !== undefined) school.adminDetails.identityNumber = identityNumber;
    if (identityDocumentUrl !== undefined) school.adminDetails.identityDocumentUrl = identityDocumentUrl;

    // ✅ Update Admin document
    if (adminName !== undefined) admin.name = adminName;
    if (adminEmail !== undefined) admin.email = adminEmail;
    if (adminPassword) { // Only update password if a new one is provided
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        admin.password = hashedPassword;
    }


    // ✅ Subscription (School)
    if (subscriptionPlanId !== undefined) school.subscription.plan = subscriptionPlanId;
    if (paymentStatus !== undefined) school.subscription.paymentStatus = paymentStatus;

    // ✅ Save both in transaction
    await school.save({ session, validateModifiedOnly: true }); // Pass session
    await admin.save({ session, validateModifiedOnly: true }); // Pass session

    // ✅ Commit the transaction
    await session.commitTransaction();
    session.endSession();


    res.status(200).json({ message: 'School and Admin updated successfully', school, logoUrl: school.logoUrl }); // Return updated school data and logoUrl
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: 'Failed to update school and admin', details: error.message });
  }
};


const loginWithOtp = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    const school = await School.findOne({ admin: admin._id });
    if (!school) return res.status(400).json({ message: 'School not found' });

    // Block login for deactivated schools
    if (school.status !== 'active') {
      return res.status(403).json({ message: 'School is deactivated. Please contact the super admin.' });
    }

    // ✅ If OTP is provided, use OTP login
    if (otp) {
      const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (otpRecord.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'OTP expired' });
      }

      // Delete used OTPs
      await Otp.deleteMany({ email });

    } else if (password) {
      // ✅ If password is provided, use password login
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    } else {
      return res.status(400).json({ message: 'Either password or OTP is required' });
    }

 const payload = {
  schoolId: school._id,
  adminId: admin._id,
  role: 'admin'
};

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure', { expiresIn: '7d' });


    

    res.status(200).json({
      message: 'Login successful',
      token,
      school: {
        id: school._id,
        schoolName: school.schoolName,
        logoUrl: school.logoUrl,
        admin: { name: admin.name, email: admin.email }
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllSchools = async (req, res) => {
    try {
        // Extract query parameters for filtering
        const { 
            schoolName, 
            country, 
            state, 
            page = 1,
            limit = 10
        } = req.query;

        // Build filter object
        const filter = {};
        if (schoolName) filter.schoolName = { $regex: schoolName, $options: 'i' };
        if (country) filter.country = country;
        if (state) filter.state = state;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Query with filtering and pagination
        const schools = await School.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('admin', 'name email') // Populate admin details if needed
            .select('-__v'); // Exclude version key

        // Get total count for pagination info
        const totalSchools = await School.countDocuments(filter);

        // For each school, get student, teacher, and staff counts
        const schoolStats = await Promise.all(schools.map(async (school) => {
            const [studentCount, teacherCount, staffCount] = await Promise.all([
                Student.countDocuments({ schoolId: school._id }),
                Teacher.countDocuments({ schoolId: school._id }),
                Staff.countDocuments({ schoolId: school._id })
            ]);
            return {
                ...school.toObject(),
                status: school.status,
                studentCount,
                teacherCount,
                staffCount
            };
        }));

        res.status(200).json({
            success: true,
            count: schools.length,
            total: totalSchools,
            page: parseInt(page),
            pages: Math.ceil(totalSchools / limit),
            data: schoolStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching schools',
            error: error.message 
        });
    }
};

const getSchoolById = async (req, res) => {
    const { schoolId } = req.params;

    if (!schoolId) {
        return res.status(400).json({ message: 'School ID is required' });
    }

    try {
        // Select all relevant fields including nested ones and razorpay config
        // Populate the 'admin' field and select 'name' and 'email' from the Admin document
        const school = await School.findById(schoolId)
            .select('schoolName address city state country postalCode phone alternatePhone website establishmentYear affiliation schoolCode principalName logoUrl businessDetails adminDetails razorpay admin') // Include 'admin' field and logo
            .populate('admin', 'name email'); // Populate the 'admin' field and select 'name' and 'email'

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const normalizedLogo = typeof school.logoUrl === 'string'
            ? school.logoUrl.replace(/\\+/g, '/').replace(/^\.\//, '').replace(/^public\//i, '')
            : school.logoUrl;

        res.status(200).json({
            message: 'School fetched successfully',
            school: {
                ...school.toObject(),
                logoUrl: normalizedLogo,
            }
        });
    } catch (error) {
        console.error('Error fetching school by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const Joi = require('joi'); // Import Joi for validation

// Joi schema for validating Razorpay config update input
const updateRazorpayConfigSchema = Joi.object({
  key_id: Joi.string().required(),
  key_secret: Joi.string().required(),
});

/**
 * @desc Update Razorpay configuration for a school
 * @route PUT /api/school/configure-razorpay/:schoolId
 * @access Private (School Admin)
 */
const updateSchoolRazorpayConfig = async (req, res) => {
  const { schoolId } = req.params;
  const { key_id, key_secret } = req.body;

  try {
    // Ensure the authenticated user is the admin of this school
    if (req.user.schoolId.toString() !== schoolId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only configure your own school' });
    }

    // Basic validation
    if (!key_id || !key_secret) {
      return res.status(400).json({ success: false, message: 'Razorpay Key ID and Key Secret are required.' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    // Update Razorpay configuration
    school.razorpay.key_id = key_id;
    school.razorpay.key_secret = key_secret;

    await school.save();

    res.status(200).json({ success: true, message: 'Razorpay configuration updated successfully.', school: school.razorpay });

  } catch (error) {
    console.error('Error updating Razorpay config:', error);
    res.status(500).json({ success: false, message: 'Server error updating Razorpay configuration', error: error.message });
  }
};

// Toggle school status (active/inactive)
const toggleSchoolStatus = async (req, res) => {
    const { schoolId } = req.params;
    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }
        school.status = school.status === 'active' ? 'inactive' : 'active';
        await school.save({ validateBeforeSave: false });
        res.status(200).json({ success: true, message: `School status updated to ${school.status}`, status: school.status });
    } catch (error) {
        console.error('Error in toggleSchoolStatus:', error);
        res.status(500).json({ success: false, message: 'Server error while updating status', error: error.message });
    }
};

// Add school by super admin (no OTP required)
const addSchoolBySuperAdmin = async (req, res) => {
  const {
    email,
    schoolName, address, city, state, country, postalCode,
    phone, alternatePhone, website, establishmentYear, affiliation, schoolCode,
    principalName, gstNumber, panNumber, licenseNumber,
    accountHolderName, bankName, accountNumber, ifscCode, upiId,
    adminName, adminEmail, adminPassword, identityType, identityNumber,
    subscriptionPlanId
  } = req.body;

  const processedIdentityType = identityType === '' ? undefined : identityType;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ 1. Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // ✅ 2. Create admin (not saved yet)
    const admin = new Admin({ name: adminName, email: adminEmail, password: hashedPassword });

    // ✅ Get file paths from req.files
    const logoPath = req.files && req.files['logoUrl'] ? req.files['logoUrl'][0].path : undefined;
    const identityDocumentPath = req.files && req.files['identityDocumentUrl'] ? req.files['identityDocumentUrl'][0].path : undefined;
    const registrationCertificatePath = req.files && req.files['registrationCertificateUrl'] ? req.files['registrationCertificateUrl'][0].path : undefined;

    // ✅ 3. Create school with admin ref and file paths
    const school = new School({
      schoolName, address, city, state, country, postalCode,
      email, phone, alternatePhone, website, establishmentYear, affiliation, schoolCode,
      logoUrl: logoPath,
      principalName,
      businessDetails: {
        gstNumber, panNumber, licenseNumber,
        registrationCertificateUrl: registrationCertificatePath,
        accountHolderName, bankName, accountNumber, ifscCode, upiId
      },
      adminDetails: {
        fullName: adminName,
        email: adminEmail,
        phone,
        role: 'Admin',
        identityType: processedIdentityType,
        identityNumber,
        identityDocumentUrl: identityDocumentPath
      },
      admin: admin._id,
      // No subscription logic for now
    });

    // ✅ Save both in transaction
    await admin.save({ session });
    await school.save({ session });

    // ✅ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'School and Admin added successfully',
      schoolId: school._id,
      schoolName: school.schoolName,
      logoUrl: school.logoUrl,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Handle duplicate key errors gracefully
    if (error && error.code === 11000) {
      const dupField = Object.keys(error.keyPattern || error.keyValue || {})[0];
      let details = 'Duplicate value';
      if (dupField === 'schoolName') details = 'School name already exists. Please choose a different name or add a branch identifier.';
      if (dupField === 'email') details = 'Email already exists. Please use a different email address.';
      if (dupField === 'phone') details = 'Phone number already exists. Please use a different phone number.';
      if (dupField === 'schoolCode') details = 'School code already exists. Please use a different code.';
      return res.status(409).json({
        error: 'Duplicate key',
        field: dupField,
        details
      });
    }
    return res.status(500).json({
      error: 'School add by super admin failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : {}
    });
  }
};

module.exports = {
    registerSchool,
    loginWithOtp,
    getAllSchools,
    updateSchool,
    getSchoolById,
    updateSchoolRazorpayConfig,
    toggleSchoolStatus,
    addSchoolBySuperAdmin
};
