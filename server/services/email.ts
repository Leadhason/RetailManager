import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

interface BulkEmailParams {
  from: string;
  subject: string;
  text?: string;
  html?: string;
  recipients: Array<{
    email: string;
    name?: string;
    substitutions?: Record<string, string>;
  }>;
}

export class EmailService {
  static async sendEmail(params: EmailParams): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email would be sent:', params);
      return true; // Return true for development
    }

    try {
      await mailService.send({
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html,
        templateId: params.templateId,
        dynamicTemplateData: params.dynamicTemplateData,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  static async sendBulkEmail(params: BulkEmailParams): Promise<{ success: number; failed: number }> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Bulk email would be sent to:', params.recipients.length, 'recipients');
      return { success: params.recipients.length, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const recipient of params.recipients) {
      try {
        await mailService.send({
          to: recipient.email,
          from: params.from,
          subject: params.subject,
          text: params.text,
          html: params.html,
        });
        success++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  static async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    orderTotal: number
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      from: process.env.FROM_EMAIL || 'noreply@edmax.com',
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Your order ${orderNumber} has been confirmed.</p>
        <p><strong>Order Total: GHS ${orderTotal}</strong></p>
        <p>We will notify you when your order ships.</p>
        <p>Best regards,<br>EDMAX Team</p>
      `
    });
  }

  static async sendLowStockAlert(
    adminEmail: string,
    productName: string,
    currentStock: number,
    reorderLevel: number
  ): Promise<boolean> {
    return this.sendEmail({
      to: adminEmail,
      from: process.env.FROM_EMAIL || 'alerts@edmax.com',
      subject: `Low Stock Alert - ${productName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Current Stock:</strong> ${currentStock} units</p>
        <p><strong>Reorder Level:</strong> ${reorderLevel} units</p>
        <p>Please consider reordering this product to avoid stockouts.</p>
        <p>EDMAX Inventory System</p>
      `
    });
  }

  static async sendWelcomeEmail(
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      from: process.env.FROM_EMAIL || 'welcome@edmax.com',
      subject: 'Welcome to EDMAX!',
      html: `
        <h2>Welcome to EDMAX!</h2>
        <p>Dear ${customerName},</p>
        <p>Welcome to EDMAX, your trusted partner for building and power technologies.</p>
        <p>We're excited to have you as part of our community and look forward to serving you.</p>
        <p>Best regards,<br>EDMAX Team</p>
      `
    });
  }
}
