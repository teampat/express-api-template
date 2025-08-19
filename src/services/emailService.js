const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Load email templates
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '..', 'templates');
    const templates = {};

    try {
      // Create templates directory if it doesn't exist
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
        this.createDefaultTemplates(templatesDir);
      }

      // Load all template files
      const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.hbs'));

      templateFiles.forEach(file => {
        const templateName = path.basename(file, '.hbs');
        const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf8');
        templates[templateName] = handlebars.compile(templateContent);
      });
    } catch (error) {
      logger.error('Error loading email templates:', error);
    }

    return templates;
  }

  createDefaultTemplates(templatesDir) {
    // Welcome email template
    const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to {{appName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{appName}}</h1>
        </div>
        <div class="content">
            <h2>Hello {{firstName}}!</h2>
            <p>Thank you for registering with {{appName}}. We're excited to have you on board!</p>
            <p>You can now start using all the features of our platform.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
        </div>
    </div>
</body>
</html>`;

    // Password reset template
    const resetPasswordTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - {{appName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello!</h2>
            <p>You are receiving this email because we received a password reset request for your account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <div class="warning">
                <strong>Important:</strong> This password reset link will expire in 10 minutes.
            </div>
            <p>If you did not request a password reset, no further action is required.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(templatesDir, 'welcome.hbs'), welcomeTemplate);
    fs.writeFileSync(path.join(templatesDir, 'reset-password.hbs'), resetPasswordTemplate);
  }

  async sendEmail(to, subject, template, data = {}) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }

      const html = this.templates[template] ? this.templates[template](data) : template;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${subject}`);
      return result;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const data = {
      appName: 'Express API Template',
      firstName: firstName || 'User'
    };

    return this.sendEmail(email, 'Welcome to Express API Template', 'welcome', data);
  }

  async sendPasswordReset(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const data = {
      appName: 'Express API Template',
      resetUrl
    };

    return this.sendEmail(email, 'Password Reset Request', 'reset-password', data);
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }

      await this.transporter.verify();
      logger.info('Email service connection verified successfully');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
