function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function contactEmailTemplate({ name, school, email, phone, message, ip, userAgent, createdAt }) {
  const safe = {
    name: escapeHtml(name),
    school: escapeHtml(school),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    message: escapeHtml(message || ''),
    ip: escapeHtml(ip || ''),
    userAgent: escapeHtml(userAgent || ''),
  };

  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
      <tr>
        <td style="padding:0;background:linear-gradient(90deg,#facc15,#dc2626);">
          <div style="padding:20px 24px; color:#fff;">
            <div style="font-size:18px;font-weight:700;">New Contact Query</div>
            <div style="opacity:.9;font-size:13px;margin-top:4px;">A new contact request was submitted from your website</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 10px;">
            <tr>
              <td style="width:160px;color:#475569;font-size:13px;">Full Name</td>
              <td style="font-size:14px;color:#0f172a;font-weight:600;">${safe.name}</td>
            </tr>
            <tr>
              <td style="width:160px;color:#475569;font-size:13px;">School</td>
              <td style="font-size:14px;color:#0f172a;">${safe.school}</td>
            </tr>
            <tr>
              <td style="width:160px;color:#475569;font-size:13px;">Email</td>
              <td style="font-size:14px;color:#0f172a;">${safe.email}</td>
            </tr>
            <tr>
              <td style="width:160px;color:#475569;font-size:13px;">Phone</td>
              <td style="font-size:14px;color:#0f172a;">${safe.phone}</td>
            </tr>
            <tr>
              <td style="vertical-align:top;width:160px;color:#475569;font-size:13px;">Message</td>
              <td style="font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap;">${safe.message || '<span style="opacity:.6">(No message)</span>'}</td>
            </tr>
          </table>
          
        </td>
      </tr>
      
    </table>
  </div>`;
}

module.exports = { contactEmailTemplate };
