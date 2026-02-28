// smsService.js
import axios from 'axios';

const SMS_CONFIG = {
  baseURL: 'https://zostosms.com/api/v3',
  apiKey: '579|HGIjT0RYaA1pDIfyKNWnVjrUdoq9eby72WLHIb5Rff927dca',
  senderId: 'ZOSTOT'
};

export const smsService = {
  // Send single SMS using ZostoSMS API
  async sendSMS(phoneNumber, message, templateId) {
    try {
      // Format phone number (ensure it has country code without +)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      if (!formattedPhone.startsWith('91')) {
        // Assuming Indian numbers, add country code if missing
        phoneNumber = '91' + formattedPhone;
      } else {
        phoneNumber = formattedPhone;
      }
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      const response = await axios.post(
        `${SMS_CONFIG.baseURL}/sms/send?recipient=${phoneNumber}&sender_id=${SMS_CONFIG.senderId}&message=${encodedMessage}&type=plain&dlt_template_id=${templateId}`,
        null, // No request body
        {
          headers: {
            'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  },

  // Send bulk SMS (for multiple recipients)
  async sendBulkSMS(phoneNumbers, message, templateId) {
    try {
      const results = [];
      
      for (const phoneNumber of phoneNumbers) {
        try {
          const result = await this.sendSMS(phoneNumber, message, templateId);
          results.push({ phoneNumber, success: true, result });
        } catch (error) {
          results.push({ phoneNumber, success: false, error: error.message });
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return results;
    } catch (error) {
      console.error('Bulk SMS sending failed:', error);
      throw error;
    }
  }
};