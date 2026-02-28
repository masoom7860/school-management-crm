const { sendEmailNotification } = require('../services/notificationService');
const { contactEmailTemplate } = require('../templates/contactEmailTemplate');

const parseToList = (s) => {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  return String(s)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const sendContact = async (req, res) => {
  try {
    const { name, school, email, phone, message } = req.body || {};
    if (!name || !school || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    const html = contactEmailTemplate({ name, school, email, phone, message, ip, userAgent, createdAt: new Date().toISOString() });
    const text = `New Contact Query\nName: ${name}\nSchool: ${school}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message || ''}`;

    const toEnv = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER;
    const recipients = parseToList(toEnv).join(', ');
    if (!recipients) {
      return res.status(500).json({ success: false, message: 'No contact recipient configured' });
    }

    const subject = `New Contact Query - ${school} (${name})`;
    const result = await sendEmailNotification(recipients, subject, text, html);
    if (!result?.success) {
      return res.status(500).json({ success: false, message: 'Failed to send contact email', error: result?.message });
    }

    return res.status(200).json({ success: true, message: 'Your request has been received. We will contact you shortly.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { sendContact };
