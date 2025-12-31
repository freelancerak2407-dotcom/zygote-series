const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
    constructor() {
        // Create reusable transporter
        this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        });
    }

    /**
     * Generate 6-digit OTP
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP email
     */
    async sendOTP(email, otp, fullName = 'User') {
        const mailOptions = {
            from: `"ZYGOTE" <${config.SMTP_USER}>`,
            to: email,
            subject: 'Your ZYGOTE Verification Code',
            html: this.getOTPTemplate(otp, fullName),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('OTP email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw new Error('Failed to send OTP email');
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcome(email, fullName) {
        const mailOptions = {
            from: `"ZYGOTE" <${config.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to ZYGOTE - Medical Learning Platform',
            html: this.getWelcomeTemplate(fullName),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            // Don't throw - welcome email is not critical
            return { success: false, error: error.message };
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(email, resetToken, fullName) {
        const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"ZYGOTE" <${config.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your ZYGOTE Password',
            html: this.getPasswordResetTemplate(resetUrl, fullName),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    /**
     * Send subscription confirmation email
     */
    async sendSubscriptionConfirmation(email, fullName, planType, endDate) {
        const mailOptions = {
            from: `"ZYGOTE" <${config.SMTP_USER}>`,
            to: email,
            subject: 'ZYGOTE Subscription Confirmed',
            html: this.getSubscriptionTemplate(fullName, planType, endDate),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Subscription email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending subscription email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * OTP Email Template
     */
    getOTPTemplate(otp, fullName) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧬 ZYGOTE</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Medical Learning Platform</p>
        </div>
        <div class="content">
            <h2 style="color: #2d3748; margin-top: 0;">Hello ${fullName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for registering with ZYGOTE. To complete your registration, please use the verification code below:
            </p>
            <div class="otp-box">
                <p style="margin: 0; color: #6c757d; font-size: 14px;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 13px;">Valid for 10 minutes</p>
            </div>
            <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0;">© 2025 ZYGOTE. All rights reserved.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">A doctor-run medical learning platform for MBBS students</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Welcome Email Template
     */
    getWelcomeTemplate(fullName) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧬 Welcome to ZYGOTE!</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d3748;">Hello ${fullName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Welcome to ZYGOTE - your comprehensive medical learning platform designed by doctors for MBBS students.
            </p>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                You now have access to:
            </p>
            <ul style="color: #4a5568; font-size: 15px; line-height: 1.8;">
                <li>Structured notes for all MBBS years</li>
                <li>Quick summaries for rapid revision</li>
                <li>Visual mind maps for better retention</li>
                <li>Practice MCQs with detailed explanations</li>
                <li>Track your learning progress</li>
            </ul>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Start your medical learning journey today!
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0;">© 2025 ZYGOTE. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Password Reset Template
     */
    getPasswordResetTemplate(resetUrl, fullName) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d3748;">Hello ${fullName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your ZYGOTE password. Click the button below to create a new password:
            </p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0;">© 2025 ZYGOTE. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Subscription Confirmation Template
     */
    getSubscriptionTemplate(fullName, planType, endDate) {
        const planNames = {
            '6_months': '6 Months',
            '12_months': '12 Months',
            '24_months': '24 Months'
        };

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Subscription Confirmed!</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d3748;">Hello ${fullName},</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your ZYGOTE subscription has been successfully activated!
            </p>
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;"><strong>Plan:</strong> ${planNames[planType] || planType}</p>
                <p style="margin: 10px 0 0 0; color: #065f46;"><strong>Valid Until:</strong> ${new Date(endDate).toLocaleDateString()}</p>
            </div>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                You now have full access to all ZYGOTE features. Happy learning!
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0;">© 2025 ZYGOTE. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
}

module.exports = new EmailService();
