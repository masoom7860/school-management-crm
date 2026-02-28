import React from 'react';
import registerSchoolImage from '../../../assets/School CRM/registerschool.png';

const SchoolRegistrationGuide = () => {
  return (
    <div className="doc-page">
      <h2>🏫 School Registration Guide</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          New schools can register in the Zosto School Management System using the School Registration form. This guide covers the complete registration process, required information, and step-by-step instructions for getting your school set up.
        </p>
        <p>
          <strong>Registration Mode:</strong> There are two registration methods:
        </p>
        <ul>
          <li><strong>Direct Registration:</strong> Register your school directly through the application</li>
          <li><strong>Super Admin Registration:</strong> Super admin can register schools directly without OTP verification</li>
        </ul>
      </section>

      <section>
        <h3>📋 Registration Requirements</h3>
        <p>Before registering, please have the following information ready:</p>
        
        <div className="feature-section">
          <h4>School Information Required</h4>
          <ul>
            <li>School Name (official name)</li>
            <li>School Address</li>
            <li>City, State, Country</li>
            <li>Postal/Zip Code</li>
            <li>Phone Number (primary)</li>
            <li>Alternate Phone Number (optional)</li>
            <li>Website URL (optional)</li>
            <li>Year of Establishment</li>
            <li>Principal Name</li>
            <li>School Affiliation (CBSE, ICSE, etc. - optional)</li>
            <li>School Code (if applicable - optional)</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>Business & Banking Information</h4>
          <ul>
            <li>GST Number (if applicable - optional)</li>
            <li>PAN Number (if applicable - optional)</li>
            <li>License Number (if applicable - optional)</li>
            <li><strong>Bank Account Details:</strong>
              <ul>
                <li>Account Holder Name</li>
                <li>Bank Name</li>
                <li>Account Number</li>
                <li>IFSC Code</li>
              </ul>
            </li>
            <li>UPI ID (optional - for digital payments)</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>Admin Account Information</h4>
          <ul>
            <li>Administrator Name (person who will manage school)</li>
            <li>Administrator Email (will be login email)</li>
            <li>Administrator Password (must be strong)</li>
            <li>Identity Type (Passport, Aadhar, Driving License, etc.)</li>
            <li>Identity Number (corresponding to identity type)</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>Documents to Upload</h4>
          <ul>
            <li><strong>School Logo:</strong> School's official logo (JPG, PNG - optional but recommended)</li>
            <li><strong>Registration Certificate:</strong> School registration certificate or recognition letter</li>
            <li><strong>Identity Document:</strong> Admin's identity proof document</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>🔐 Registration Process - Direct Registration</h3>
        
        <div className="task-item">
          <h4>Step 1: Access Registration Page</h4>
          <ol>
            <li>Click on "Register" button on the home page</li>
            <li>Or navigate directly to the registration page</li>
            <li>You should see the registration form with multiple steps</li>
            <li>Current step is indicated at the top</li>
          </ol>
          <div className="screenshot-placeholder">
            <img
              src={registerSchoolImage}
              alt="School registration form overview"
              className="screenshot-image"
            />
          </div>
        </div>

        <div className="task-item">
          <h4>Step 2: Fill School Details (Step 1 of 4)</h4>
          <ol>
            <li>Enter your <strong>School Name</strong> (official name)</li>
            <li>Enter <strong>School Address</strong> (full address)</li>
            <li>Enter <strong>City</strong> where school is located</li>
            <li>Enter <strong>State</strong></li>
            <li>Enter <strong>Country</strong></li>
            <li>Enter <strong>Postal Code</strong></li>
            <li>Enter <strong>Phone Number</strong> (primary contact)</li>
            <li>Enter <strong>Alternate Phone Number</strong> (optional)</li>
            <li>Enter <strong>Website</strong> (optional - include http:// or https://)</li>
            <li>Enter <strong>Establishment Year</strong> (year school was founded)</li>
            <li>Enter <strong>Principal Name</strong> (name of school principal)</li>
            <li>Click "Next" to proceed to Step 2</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>Step 3: Fill More School Details (Step 2 of 4)</h4>
          <ol>
            <li>Enter <strong>School Affiliation</strong> (CBSE, ICSE, State Board, etc. - optional)</li>
            <li>Enter <strong>School Code</strong> (if you have one - optional)</li>
            <li>Upload <strong>School Logo</strong> (click upload button to select file)</li>
            <li>Note: Logo preview will appear after upload</li>
            <li>Click "Next" to proceed to Step 3</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>Step 4: Fill Business & Admin Details (Step 3 of 4)</h4>
          <ol>
            <li><strong>Banking Information:</strong>
              <ul>
                <li>Account Holder Name</li>
                <li>Bank Name</li>
                <li>Account Number</li>
                <li>IFSC Code</li>
                <li>UPI ID (optional)</li>
              </ul>
            </li>
            <li><strong>Tax Information:</strong>
              <ul>
                <li>GST Number (optional)</li>
                <li>PAN Number (optional)</li>
                <li>License Number (optional)</li>
              </ul>
            </li>
            <li><strong>Admin Account Information:</strong>
              <ul>
                <li>Administrator Name (full name)</li>
                <li>Administrator Email (will use for login)</li>
                <li>Administrator Password (strong password - min 8 chars with uppercase, lowercase, number, special char)</li>
              </ul>
            </li>
            <li><strong>Identity Information:</strong>
              <ul>
                <li>Identity Type (select from dropdown: Passport, Aadhar, Driving License, etc.)</li>
                <li>Identity Number (corresponding to identity type)</li>
              </ul>
            </li>
            <li>Upload <strong>Registration Certificate</strong> (click to select file)</li>
            <li>Upload <strong>Identity Document</strong> (admin's identity proof)</li>
            <li>Click "Next to proceed to OTP verification</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>Step 5: OTP Verification (Step 4 of 4)</h4>
          <ol>
            <li>An OTP will be sent to your <strong>Administrator Email</strong></li>
            <li>Check your email inbox (check spam if not found)</li>
            <li>Enter the 6-digit OTP in the fields provided</li>
            <li>Each field accepts one digit</li>
            <li>Tab automatically moves to next field when you enter a digit</li>
            <li>If OTP expires (5 minutes), click "Resend OTP" button</li>
            <li>Click "Submit" button to complete registration</li>
            <li>Wait for registration to be processed (this may take a few seconds)</li>
          </ol>
        </div>

        <div className="task-item">
          <h4>Step 6: Confirmation</h4>
          <ol>
            <li>You'll see a success message: "School registered successfully!"</li>
            <li>You'll be redirected to login page automatically</li>
            <li>Login with your administrator email and password</li>
            <li>You can now access your school's admin dashboard</li>
          </ol>
        </div>
      </section>

      <section>
        <h3>🔑 Password Requirements</h3>
        <p><strong>Your administrator password must be strong and contain:</strong></p>
        <ul>
          <li>Minimum 8 characters long</li>
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one number (0-9)</li>
          <li>At least one special character (!@#$%^&*)</li>
        </ul>
        <p><strong>Example strong password:</strong> Admin@123</p>
      </section>

      <section>
        <h3>📧 Email Verification</h3>
        <p><strong>Important points about email verification:</strong></p>
        <ul>
          <li>OTP will be sent to your <strong>Administrator Email</strong></li>
          <li>Check your spam/junk folder if you don't see the email within 2 minutes</li>
          <li>OTP is valid for 5 minutes (300 seconds)</li>
          <li>You can request a new OTP by clicking "Resend OTP"</li>
          <li>Make sure the email address is correct before proceeding</li>
          <li>Keep this email address safe - you'll use it to login</li>
        </ul>
      </section>

      <section>
        <h3>📄 Document Upload Guidelines</h3>
        
        <div className="feature-section">
          <h4>Supported File Formats</h4>
          <ul>
            <li>JPG/JPEG</li>
            <li>PNG</li>
            <li>PDF (for certificates and documents)</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>File Size Limits</h4>
          <ul>
            <li>Maximum file size: 5MB per file</li>
            <li>Larger files will be rejected</li>
            <li>Compress images if needed before uploading</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>Document Quality</h4>
          <ul>
            <li>School Logo: Should be clear and in correct color</li>
            <li>Registration Certificate: Should be clear and readable</li>
            <li>Identity Document: Should show all details clearly</li>
            <li>No blurry or incomplete documents will be accepted</li>
          </ul>
        </div>

        <div className="feature-section">
          <h4>Tips for Document Upload</h4>
          <ul>
            <li>Take clear photos or scans of documents</li>
            <li>Ensure good lighting to avoid shadows</li>
            <li>Include all 4 corners of the document</li>
            <li>Use JPG or PNG format for best results</li>
            <li>Resize large images to reduce file size</li>
          </ul>
        </div>
      </section>

      <section>
        <h3>💡 Best Practices for Registration</h3>
        <ul>
          <li><strong>Accuracy:</strong> Double-check all school information before submitting</li>
          <li><strong>Email:</strong> Use an email address you check regularly</li>
          <li><strong>Password:</strong> Store your password in a safe place</li>
          <li><strong>Documents:</strong> Keep scans of all uploaded documents</li>
          <li><strong>Contact Info:</strong> Use verified phone and email addresses</li>
          <li><strong>Banking Details:</strong> Verify all banking information is correct</li>
          <li><strong>Time:</strong> Register when you have 10-15 minutes available</li>
          <li><strong>Internet:</strong> Use stable internet connection during registration</li>
          <li><strong>Completion:</strong> Complete registration in one session - don't close the form</li>
          <li><strong>Confirmation:</strong> Save confirmation details after successful registration</li>
        </ul>
      </section>

      <section>
        <h3>❓ Troubleshooting & FAQ</h3>
        <div className="troubleshooting">
          <h4>OTP not received?</h4>
          <p>Check spam/junk folder first. Make sure email address is correct. Click "Resend OTP" to request again. Wait 2-3 minutes for email to arrive.</p>

          <h4>OTP expired?</h4>
          <p>OTP is valid for 5 minutes. If expired, click "Resend OTP" button to get a new one. You'll have 5 more minutes with the new OTP.</p>

          <h4>Invalid OTP error?</h4>
          <p>Check that you've entered the correct OTP code. OTP is case-sensitive. Make sure you haven't added any extra spaces. Try resending OTP if multiple attempts fail.</p>

          <h4>Password validation failed?</h4>
          <p>Password must be at least 8 characters with uppercase, lowercase, number, and special character. Example: Admin@123 meets requirements.</p>

          <h4>File upload failed?</h4>
          <p>Check file format (JPG, PNG, PDF only). Ensure file size is under 5MB. Try a different file or compress the image. Check internet connection.</p>

          <h4>Email already registered?</h4>
          <p>This email has already been used for registration. Use a different email address. If it's your account, try logging in instead of registering.</p>

          <h4>Required field missing?</h4>
          <p>Some fields are marked as required (indicated by *). Fill in all required fields before clicking Next. Optional fields can be left blank.</p>

          <h4>Invalid email format?</h4>
          <p>Email should be in format: name@domain.com. Check for typos. Make sure you didn't add spaces. Use valid domain like gmail.com, yahoo.com, etc.</p>

          <h4>Phone number format?</h4>
          <p>Enter phone number in standard format (10 digits for most countries). You can include country code if needed.</p>

          <h4>Website URL format?</h4>
          <p>Include protocol in website URL. Example: https://www.example.com (not just www.example.com)</p>

          <h4>Form won't submit?</h4>
          <p>Check for red error messages. Fill all required fields. Ensure file uploads are complete. Check internet connection. Try refreshing and starting over if stuck.</p>

          <h4>Registration stuck on loading?</h4>
          <p>Wait 1-2 minutes for the system to process. Check internet connection. If still stuck, refresh the page and restart registration (it may have already completed).</p>

          <h4>After registration, I can't login?</h4>
          <p>Wait 1-2 minutes after successful registration. Use administrator email (not school name) as username. Check that caps lock is off. Try resetting password if you forgot it.</p>

          <h4>School name already exists?</h4>
          <p>School name must be unique. Add city or zone to make it unique if needed (e.g., "ABC School Delhi" instead of "ABC School").</p>

          <h4>Bank account details incorrect?</h4>
          <p>Double-check account number and IFSC code. These can be updated later from admin dashboard under Settings. Contact your bank for correct IFSC code.</p>

          <h4>Lost registration confirmation?</h4>
          <p>Check your email inbox and spam folder. Login to your admin account to verify registration was successful. Contact support with your email if needed.</p>
        </div>
      </section>

      <section>
        <h3>✅ After Registration</h3>
        <p><strong>What happens after successful registration:</strong></p>
        <ul>
          <li>Confirmation email will be sent to your administrator email</li>
          <li>You can now login to your admin dashboard</li>
          <li>Set up your school's basic information</li>
          <li>Create classes and sections</li>
          <li>Add staff and teachers</li>
          <li>Invite parents and students</li>
          <li>Start managing your school</li>
        </ul>
      </section>

      <section>
        <h3>🆘 Need Help?</h3>
        <p>If you encounter any issues during registration:</p>
        <ul>
          <li>Read the troubleshooting section above</li>
          <li>Check that all required information is filled correctly</li>
          <li>Try refreshing the page if you see errors</li>
          <li>Check your internet connection</li>
          <li>Contact support if the issue persists</li>
          <li>Provide your email and the error message you received</li>
        </ul>
      </section>

      <section>
        <h3>📝 Registration Checklist</h3>
        <p>Before submitting your registration, verify:</p>
        <ul>
          <li>☐ School name is correct</li>
          <li>☐ Complete address with city, state, country</li>
          <li>☐ Valid phone number</li>
          <li>☐ Principal name is correct</li>
          <li>☐ Administrator email is correct (you can login with this)</li>
          <li>☐ Strong password created (8+ chars with uppercase, lowercase, number, special char)</li>
          <li>☐ Valid bank account details</li>
          <li>☐ Documents uploaded (if required)</li>
          <li>☐ All required fields are filled (*)</li>
          <li>☐ Ready to receive OTP on your email</li>
        </ul>
      </section>
    </div>
  );
};

export default SchoolRegistrationGuide;
