const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads/schools' directory exists
const schoolUploadDir = 'uploads/schools/';
if (!fs.existsSync(schoolUploadDir)) {
  fs.mkdirSync(schoolUploadDir, { recursive: true });
}

// Ensure the 'uploads/receipts' directory exists
const receiptUploadDir = 'uploads/receipts/';
if (!fs.existsSync(receiptUploadDir)) {
  fs.mkdirSync(receiptUploadDir, { recursive: true });
}

// Ensure the 'uploads/teachers' directory exists
const teacherUploadDir = 'uploads/teachers/';
if (!fs.existsSync(teacherUploadDir)) {
  fs.mkdirSync(teacherUploadDir, { recursive: true });
}

// Ensure a temporary directory for CSV uploads exists
const tempUploadDir = 'uploads/temp/';
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Storage setup for school uploads
const schoolStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, schoolUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage setup for receipt uploads
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Use originalname to preserve file extension for receipts
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Storage setup for temporary CSV uploads
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `temp-csv-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});


// File filter for school uploads
const schoolFileFilter = (req, file, cb) => {
  // Define allowed mime types for each field
  const allowedTypes = {
    logoUrl: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    identityDocumentUrl: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    registrationCertificateUrl: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname];

  if (fieldAllowedTypes && fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Reject file
    const allowed = fieldAllowedTypes ? fieldAllowedTypes.join(', ') : 'unknown file type';
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowed}`));
  }
};

// File filter for receipt uploads
const receiptFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']; // Allow images and PDFs for receipts

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for receipt. Allowed types: ${allowedTypes.join(', ')}`));
    }
};

// File filter for temporary CSV uploads
const csvFileFilter = (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel']; // Common CSV mime types

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for CSV upload. Allowed types: ${allowedTypes.join(', ')}`));
    }
};


// Multer upload configuration for school uploads
const schoolUpload = multer({
  storage: schoolStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // Increased limit to 5MB for documents
  // Removed fileFilter to allow any file type or no file for registration
});

// Multer upload configuration for receipt uploads
const receiptUpload = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Allow slightly larger size for receipts (e.g., 10MB)
  fileFilter: receiptFileFilter
});

// Multer upload configuration for temporary CSV uploads
const csvUpload = multer({
  storage: tempStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Allow larger size for bulk CSV
  fileFilter: csvFileFilter
});

// Storage setup for teacher uploads
const teacherStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teacherUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for teacher uploads
const teacherFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for photo. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Multer upload configuration for teacher uploads
const teacherUpload = multer({
  storage: teacherStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for photos
  fileFilter: teacherFileFilter
});


module.exports = {
    schoolUpload,
    receiptUpload,
    csvUpload,
    teacherUpload
};
