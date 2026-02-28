const Image = require('../models/image');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { filename, path, mimetype, size } = req.file;

    const newImage = new Image({
      filename,
      path,
      mimetype,
      size,
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: newImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};
