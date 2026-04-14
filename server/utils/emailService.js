const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * Send credentials to a new student
 * @param {string} email - Recipient email
 * @param {string} name - Student name
 * @param {string} password - Generated temporary password
 */
const sendCredentialsEmail = async (email, name, password) => {
    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Welcome to DormEase - Your Login Credentials',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563EB; margin: 0;">DORMEASE</h1>
                    <p style="color: #64748b; font-size: 14px;">Premium PG & Dormitory Management</p>
                </div>
                
                <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563EB;">
                    <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${name}!</h2>
                    <p style="color: #475569; line-height: 1.6;">
                        Your administrative account has been created. You can now log in to the DormEase portal to manage your room, view the mess menu, and track payments.
                    </p>
                    
                    <div style="margin: 25px 0; padding: 15px; background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b;">Login Credentials:</p>
                        <p style="margin: 5px 0; color: #475569;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0; color: #475569;"><strong>Temporary Password:</strong> <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</span></p>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 13px; font-style: italic;">
                        Note: For security reasons, you will be required to change this password upon your first login.
                    </p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="http://localhost:5173/login" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
                </div>
                
                <hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;" />
                <p style="text-align: center; color: #94a3b8; font-size: 12px;">
                    © 2026 DormEase Support Team. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Credentials email sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendCredentialsEmail };
