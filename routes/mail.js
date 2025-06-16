const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create a transporter using SMTP with the correct settings for savannafibre.co.tz
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'mail.savannafibre.co.tz',
        port: 465,
        secure: true, // SSL/TLS
        auth: {
            user: process.env.CUSTOMER_EMAIL,
            pass: process.env.CUSTOMER_EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Beautiful email template for contact form
const createEmailTemplate = (name, email, phone, subject, message, enquiryType) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - Savanna Fibre</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fcff;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: 600;
                color: #0d47a1;
                margin-bottom: 15px;
                border-bottom: 2px solid #e3f2fd;
                padding-bottom: 8px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .info-item {
                background-color: #f8fcff;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #0d47a1;
            }
            
            .info-label {
                font-weight: 600;
                color: #0d47a1;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 16px;
                color: #333;
                word-break: break-word;
            }
            
            .message-section {
                background-color: #f8fcff;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e3f2fd;
            }
            
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #333;
                white-space: pre-wrap;
            }
            
            .enquiry-type {
                background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                display: inline-block;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 20px;
            }
            
            .footer {
                background-color: #f5f5f5;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e0e0e0;
            }
            
            .footer p {
                color: #666;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .logo {
                font-size: 24px;
                font-weight: 700;
                color: #fff;
                margin-bottom: 10px;
            }
            
            .timestamp {
                background-color: #e8f5e8;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }
            
            .timestamp p {
                color: #2e7d32;
                font-size: 14px;
                margin: 0;
            }
            
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .content {
                    padding: 25px 20px;
                }
                
                .header {
                    padding: 25px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">🌐 Savanna Fibre</div>
                <h1>New Contact Form Submission</h1>
                <p>You have received a new message from your website</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2 class="section-title">📋 Contact Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Full Name</div>
                            <div class="info-value">${name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email Address</div>
                            <div class="info-value">${email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone Number</div>
                            <div class="info-value">${phone || 'Not provided'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Subject</div>
                            <div class="info-value">${subject || 'No subject'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">💬 Message</h2>
                    <div class="message-section">
                        <div class="message-content">${message}</div>
                    </div>
                </div>
                
                <div class="enquiry-type">
                    ${enquiryType}
                </div>
                
                <div class="timestamp">
                    <p>📅 Received on ${new Date().toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Savanna Fibre</strong> - Tanzania's Most Trusted Connectivity Provider</p>
                <p>🌐 <a href="https://savannafibre.co.tz" style="color: #0d47a1;">savannafibre.co.tz</a> | 📧 support@savannafibre.co.tz | 📞 +255 699 999 555</p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">
                    This email was sent from the contact form on your website. 
                    Please respond directly to the customer's email address above.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Special email template for internet connection requests
const createConnectionRequestTemplate = (name, phone, location) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Internet Connection Request - Savanna Fibre</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fcff;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #E5891F 0%, #F79621 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: 600;
                color: #E5891F;
                margin-bottom: 15px;
                border-bottom: 2px solid #fef3e2;
                padding-bottom: 8px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .info-item {
                background-color: #fef3e2;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #E5891F;
            }
            
            .info-label {
                font-weight: 600;
                color: #E5891F;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 16px;
                color: #333;
                word-break: break-word;
            }
            
            .priority-badge {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                display: inline-block;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 20px;
            }
            
            .footer {
                background-color: #f5f5f5;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e0e0e0;
            }
            
            .footer p {
                color: #666;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .logo {
                font-size: 24px;
                font-weight: 700;
                color: #fff;
                margin-bottom: 10px;
            }
            
            .timestamp {
                background-color: #e8f5e8;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }
            
            .timestamp p {
                color: #2e7d32;
                font-size: 14px;
                margin: 0;
            }
            
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .content {
                    padding: 25px 20px;
                }
                
                .header {
                    padding: 25px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">🌐 Savanna Fibre</div>
                <h1>New Internet Connection Request</h1>
                <p>High Priority - New customer wants to get connected!</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2 class="section-title">📋 Customer Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Full Name</div>
                            <div class="info-value">${name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone Number</div>
                            <div class="info-value">${phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Location</div>
                            <div class="info-value">${location}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Request Type</div>
                            <div class="info-value">New Internet Connection</div>
                        </div>
                    </div>
                </div>
                
                <div class="priority-badge">
                    🚀 High Priority - Contact Customer ASAP
                </div>
                
                <div class="timestamp">
                    <p>📅 Received on ${new Date().toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Savanna Fibre</strong> - Tanzania's Most Trusted Connectivity Provider</p>
                <p>🌐 <a href="https://savannafibre.co.tz" style="color: #E5891F;">savannafibre.co.tz</a> | 📧 support@savannafibre.co.tz | 📞 +255 699 999 555</p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">
                    This is a high-priority connection request from the homepage. 
                    Please contact the customer immediately to discuss their internet needs.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// POST /send-mail
router.post('/send-mail', async (req, res) => {
    try {
        const { name, email, phone, subject, message, location } = req.body;

        // Validate required fields
        if (!name || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name and message are required'
            });
        }

        // Determine which email to send to and create appropriate template
        let recipientEmail;
        let emailHTML;
        let emailSubject;

        // Check if this is an internet connection request from homepage
        if (subject && subject.toLowerCase().includes('internet connection request')) {
            recipientEmail = process.env.SALES_EMAIL; // Always send to sales
            emailHTML = createConnectionRequestTemplate(name, phone, location);
            emailSubject = `🚀 New Internet Connection Request - ${name} from ${location}`;
        } else {
            // Regular contact form
            if (subject && subject.toLowerCase().includes('general')) {
                recipientEmail = process.env.SUPPORT_EMAIL;
            } else {
                recipientEmail = process.env.SALES_EMAIL;
            }
            
            const enquiryType = subject && subject.toLowerCase().includes('general') ? 'General Enquiry (Support)' : 'Sales Enquiry';
            emailHTML = createEmailTemplate(name, email, phone, subject, message, enquiryType);
            emailSubject = `🌐 New Contact Form: ${subject || 'Website Enquiry'} - Savanna Fibre`;
        }

        // Create transporter
        const transporter = createTransporter();

        // Email content
        const mailOptions = {
            from: `"Savanna Fibre Contact Form" <${process.env.CUSTOMER_EMAIL}>`,
            to: recipientEmail,
            subject: emailSubject,
            html: emailHTML
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Request sent successfully! We\'ll contact you soon.'
        });

    } catch (error) {
        console.error('Email sending error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send request. Please try again later.';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check email credentials.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Email connection failed. Please check internet connection.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

module.exports = router; 