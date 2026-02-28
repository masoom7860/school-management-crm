const Otp = require('../models/otp');
const nodemailer = require('nodemailer');

// Send OTP function
const sendOtp = async (req, res) => {
  const { email, purpose = 'general' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Remove old OTPs for this email
  await Otp.deleteMany({ email });

  // Create a new OTP with 5-minute expiry
  const expiryTime = Date.now() + 5 * 60 * 1000;
  await Otp.create({ email, otp, expiry: expiryTime });

  // Determine subject and content based on purpose
  let subject = 'Your OTP';
  let description = 'Use the following OTP for verification.';

  switch (purpose) {
    case 'registration':
      subject = 'School Registration OTP';
      description = 'Use the following OTP to complete your school registration.';
      break;
    case 'login':
      subject = 'Login OTP';
      description = 'Use the following OTP to log in to your School Management account.';
      break;
    case 'forgot-password':
      subject = 'Reset Password OTP';
      description = 'Use the following OTP to reset your account password.';
      break;
    default:
      break;
  }

  // HTML email content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #2E86C1;">School Management System</h2>
        <p>Hi,</p>
        <p>${description} This OTP is valid for <strong>5 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; letter-spacing: 8px; color: #000; background: #f2f2f2; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                ${otp}
            </span>
        </div>
        <p style="color: #888;">If you didn’t request this, please ignore this email.</p>
        <p style="margin-top: 40px;">Thanks,<br/>School Management CRM Team</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('OTP Email Send Error:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
};

module.exports = { sendOtp };

// Verify OTP function
const verifyOtp = async ({ email, otp }) => {
    try {
        // Check if OTP exists
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return { valid: false, message: 'Invalid OTP' };
        }

        // Check if OTP has expired
        const now = new Date();
        const otpCreatedAt = otpRecord.createdAt;
        const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        if (now - otpCreatedAt > otpExpirationTime) {
            return { valid: false, message: 'OTP expired' };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, message: 'OTP verification failed' };
    }
};



module.exports = {
    sendOtp,
    verifyOtp
};
