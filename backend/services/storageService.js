const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/receipts');
const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:5000'; // Assuming a backend base URL env var

const uploadToCloudStorage = async (file, folder = 'general') => {
  console.log(`Uploading file to local storage in folder: ${folder}`, file.originalname);

  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write the file buffer to the local file system
    await fs.writeFile(filePath, file.buffer);

    // Construct the URL for accessing the file
    // Assuming 'uploads' directory is served statically by the backend
    const fileUrl = `${baseUrl}/uploads/receipts/${fileName}`;

    console.log(`File saved locally at: ${filePath}`);
    console.log(`Accessible via URL: ${fileUrl}`);

    return {
      url: fileUrl,
      fileName: file.originalname, // Store original name
      storedFileName: fileName, // Store the generated unique name
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: filePath // Store local path if needed
    };

  } catch (error) {
    console.error('Error uploading file to local storage:', error);
    throw new Error('Failed to upload file to local storage');
  }
};

module.exports = {
  uploadToCloudStorage
};
