const nodemailer = require('nodemailer');
const twilio = require('twilio'); // Assuming Twilio for SMS and WhatsApp

// Configure Nodemailer (replace with your actual email service details)
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail', 'outlook'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Configure Twilio (replace with your actual Twilio account details)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

const sendEmailNotification = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent to ${to}`);
        return { success: true, message: `Email sent to ${to}` };
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        return { success: false, message: `Error sending email to ${to}`, error: error.message };
    }
};

const sendSmsNotification = async (phone, message) => {
    try {
        await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phone,
        });
        console.log(`SMS sent to ${phone}`);
        return { success: true, message: `SMS sent to ${phone}` };
    } catch (error) {
        console.error(`Error sending SMS to ${phone}:`, error);
        return { success: false, message: `Error sending SMS to ${phone}`, error: error.message };
    }
};

const sendWhatsAppNotification = async (phone, message) => {
    try {
        // Twilio WhatsApp requires a specific format for 'from' number
        await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${twilioPhoneNumber}`, // e.g., whatsapp:+14155238886
            to: `whatsapp:${phone}`,
        });
        console.log(`WhatsApp message sent to ${phone}`);
        return { success: true, message: `WhatsApp message sent to ${phone}` };
    } catch (error) {
        console.error(`Error sending WhatsApp message to ${phone}:`, error);
        return { success: false, message: `Error sending WhatsApp message to ${phone}`, error: error.message };
    }
};

module.exports = {
    sendEmailNotification,
    sendSmsNotification,
    sendWhatsAppNotification,
};
