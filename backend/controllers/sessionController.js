const Session = require('../models/sessionModel');

const getRequesterIds = (req) => {
  // verifySchoolAdmin attaches decoded into req.user for admin with { schoolId, adminId, role }
  const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
  const createdBy = req.decodedToken?.adminId || req.user?.adminId || req.user?._id || req.user?.id;
  return { schoolId, createdBy };
};

const isValidYearRange = (yearRange) => {
  // Basic format check: YYYY-YYYY and increasing years
  const match = /^(\d{4})-(\d{4})$/.exec((yearRange || '').trim());
  if (!match) return false;
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  return endYear === startYear + 1 && startYear >= 2000 && endYear <= 2100;
};

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { yearRange, startDate, endDate, description, isActive } = req.body;
    const { schoolId, createdBy } = getRequesterIds(req);
    if (!schoolId) return res.status(400).json({ message: 'School ID missing' });

    if (!yearRange || !startDate || !endDate) {
      return res.status(400).json({ message: 'yearRange, startDate and endDate are required' });
    }
    if (!isValidYearRange(yearRange)) {
      return res.status(400).json({ message: 'yearRange must be in format YYYY-YYYY and consecutive' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!(start instanceof Date && !isNaN(start)) || !(end instanceof Date && !isNaN(end))) {
      return res.status(400).json({ message: 'Invalid dates' });
    }
    if (end <= start) {
      return res.status(400).json({ message: 'endDate must be after startDate' });
    }

    const exists = await Session.findOne({ schoolId, yearRange: yearRange.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Session with this yearRange already exists for this school' });
    }

    const session = await Session.create({
      schoolId,
      yearRange: yearRange.trim(),
      startDate: start,
      endDate: end,
      description: (description || '').trim(),
      isActive: Boolean(isActive),
      createdBy,
    });

    // If created as active, deactivate others for the same school
    if (session.isActive) {
      await Session.updateMany({ schoolId, _id: { $ne: session._id } }, { $set: { isActive: false } });
    }

    res.status(201).json({ message: 'Session created successfully', data: session });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate session detected' });
    }
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

// Get sessions by school
exports.getSessionsBySchool = async (req, res) => {
  try {
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    if (!schoolId) return res.status(400).json({ message: 'School ID not found in token' });
    const sessions = await Session.find({ schoolId }).sort({ startDate: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

// Get one session
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    const session = await Session.findOne({ _id: id, schoolId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

// Update session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    const updates = { ...req.body };

    if (updates.schoolId || updates.createdBy) {
      return res.status(400).json({ message: 'Cannot modify schoolId or createdBy' });
    }

    if (typeof updates.yearRange === 'string') {
      updates.yearRange = updates.yearRange.trim();
      if (!isValidYearRange(updates.yearRange)) {
        return res.status(400).json({ message: 'yearRange must be in format YYYY-YYYY and consecutive' });
      }
      const duplicate = await Session.findOne({ schoolId, yearRange: updates.yearRange, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ message: 'Session with this yearRange already exists for this school' });
      }
    }

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.startDate && isNaN(updates.startDate)) {
      return res.status(400).json({ message: 'Invalid startDate' });
    }
    if (updates.endDate && isNaN(updates.endDate)) {
      return res.status(400).json({ message: 'Invalid endDate' });
    }
    if (updates.startDate && updates.endDate && updates.endDate <= updates.startDate) {
      return res.status(400).json({ message: 'endDate must be after startDate' });
    }

    const updated = await Session.findOneAndUpdate({ _id: id, schoolId }, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Session not found or does not belong to your school' });
    }

    if (updated.isActive) {
      await Session.updateMany({ schoolId, _id: { $ne: id } }, { $set: { isActive: false } });
    }

    res.status(200).json({ message: 'Session updated successfully', data: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate session detected' });
    }
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    const deleted = await Session.findOneAndDelete({ _id: id, schoolId });
    if (!deleted) {
      return res.status(404).json({ message: 'Session not found or does not belong to your school' });
    }
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};

// Activate session (and deactivate others)
exports.activateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId || req.user?.schoolId;
    const target = await Session.findOneAndUpdate({ _id: id, schoolId }, { $set: { isActive: true } }, { new: true });
    if (!target) return res.status(404).json({ message: 'Session not found' });
    await Session.updateMany({ schoolId, _id: { $ne: id } }, { $set: { isActive: false } });
    res.status(200).json({ message: 'Session activated', data: target });
  } catch (error) {
    res.status(500).json({ message: 'Error activating session', error: error.message });
  }
};

