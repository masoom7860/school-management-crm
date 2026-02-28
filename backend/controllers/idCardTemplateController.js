const IDCardTemplate = require('../models/idCardTemplateModel');

const parseTemplatePayload = (rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return {};
  }

  if (typeof rawValue === 'string') {
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      console.warn('IDCardTemplateController: Failed to parse template JSON string, storing empty object');
      return {};
    }
  }

  if (typeof rawValue === 'object') {
    return rawValue;
  }

  return {};
};

const serializeTemplateForResponse = (templateDoc) => {
  if (!templateDoc) return null;

  const templateJson = templateDoc.templateJson;

  return {
    id: templateDoc._id,
    schoolId: templateDoc.schoolId,
    type: templateDoc.type,
    templateJson: templateJson && typeof templateJson === 'object' ? templateJson : parseTemplatePayload(templateJson),
    updatedAt: templateDoc.updatedAt,
    createdAt: templateDoc.createdAt,
  };
};

exports.getIdCardTemplate = async (req, res) => {
  try {
    const schoolId = req.headers['school-id'] || req.school?._id;
    const type = (req.query.type || 'student').toString().toLowerCase();

    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School-ID header is required' });
    }

    const templateDoc = await IDCardTemplate.findOne({ schoolId, type });

    return res.json({
      success: true,
      data: serializeTemplateForResponse(templateDoc),
    });
  } catch (error) {
    console.error('Failed to fetch ID card template:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch ID card template' });
  }
};

exports.upsertIdCardTemplate = async (req, res) => {
  try {
    const schoolId = req.headers['school-id'] || req.school?._id;
    const type = (req.body.type || req.query.type || 'student').toString().toLowerCase();
    const rawTemplate = req.body.templateJson ?? req.body.template;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School-ID header is required' });
    }

    if (!type) {
      return res.status(400).json({ success: false, message: 'Template type is required' });
    }

    if (rawTemplate === undefined) {
      return res.status(400).json({ success: false, message: 'templateJson is required in request body' });
    }

    const templateJson = parseTemplatePayload(rawTemplate);

    const filter = { schoolId, type };
    const update = {
      templateJson,
      lastUpdatedBy: req.decodedToken?.id || req.decodedToken?._id || null,
    };

    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    };

    if (options.upsert) {
      update.schoolId = schoolId;
      update.type = type;
    }

    const templateDoc = await IDCardTemplate.findOneAndUpdate(filter, update, options);

    return res.json({
      success: true,
      data: serializeTemplateForResponse(templateDoc),
    });
  } catch (error) {
    console.error('Failed to save ID card template:', error);
    return res.status(500).json({ success: false, message: 'Failed to save ID card template' });
  }
};
