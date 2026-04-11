import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND_NAME = 'Travplan';
const BRAND_COLOR = '#e05323'; // Primary orange color
const BRAND_COLOR_DARK = '#c44a1e';

// Enquiry Email Types
interface EnquiryEmailData {
  name: string
  email: string
  phone: string
  packageId?: string
  packageName?: string
  preferredDate?: string
  numberOfTravelers?: string
  message?: string
}

export async function sendEnquiryNotificationEmail(enquiry: EnquiryEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_ID;

  const mailOptions = {
    from: `"${BRAND_NAME} Enquiry" <${process.env.EMAIL_ID}>`,
    to: adminEmail,
    subject: `📩 New Enquiry: ${enquiry.packageName || 'General Enquiry'} | From: ${enquiry.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Enquiry</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📩 New Enquiry Received!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">A potential customer wants to learn more</p>
                    </td>
                  </tr>
                  
                  <!-- Customer Details -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">👤 Customer Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Name</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${enquiry.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Email</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 16px;"><a href="mailto:${enquiry.email}" style="color: ${BRAND_COLOR}; text-decoration: none;">${enquiry.email}</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Phone</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 16px;"><a href="tel:${enquiry.phone}" style="color: ${BRAND_COLOR}; text-decoration: none;">${enquiry.phone}</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Trip Interest -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">✈️ Trip Interest</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        ${enquiry.packageName ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Interested Package</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${enquiry.packageName}</p>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Preferred Travel Date</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${enquiry.preferredDate || 'Not specified'}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Number of Travelers</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${enquiry.numberOfTravelers || '2'} Travelers</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  ${enquiry.message ? `
                  <!-- Message -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">💬 Message</h2>
                      <p style="margin: 0; color: #666666; font-size: 14px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR}; white-space: pre-wrap;">${enquiry.message}</p>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Quick Actions -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="mailto:${enquiry.email}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                              Reply to Customer
                            </a>
                            <a href="tel:${enquiry.phone}" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Call Customer
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. Enquiry Notification.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Enquiry notification sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending enquiry notification:', error);
    return { success: false, error };
  }
}

export async function sendEnquiryConfirmationEmail(enquiry: EnquiryEmailData) {
  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: enquiry.email,
    subject: `✅ We Received Your Enquiry - ${BRAND_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enquiry Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Thank You for Your Enquiry!</h1>
                      <p style="color: #ffe0d6; margin: 10px 0 0 0; font-size: 16px;">We've received your message</p>
                    </td>
                  </tr>
                  
                  <!-- Main content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #fff3ef; border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="${BRAND_COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">Hi ${enquiry.name},</h2>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for your interest in our travel packages! We've successfully received your enquiry and our travel experts are excited to help you plan your perfect trip.
                      </p>
                      
                      ${enquiry.packageName ? `
                      <div style="background-color: #fff3ef; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #666666; font-size: 14px; margin: 0;">
                          <strong style="color: ${BRAND_COLOR};">Your Enquiry About:</strong><br>
                          <span style="font-size: 18px; font-weight: 600; color: #333;">${enquiry.packageName}</span>
                        </p>
                      </div>
                      ` : ''}
                      
                      <div style="background-color: #fff3ef; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                          <strong style="color: ${BRAND_COLOR};">What happens next?</strong><br>
                          Our customer support team will review your enquiry and get back to you within <strong>24 hours</strong> with personalized recommendations and quotes tailored to your travel needs.
                        </p>
                      </div>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        In the meantime, feel free to explore more of our amazing travel packages!
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXTAUTH_URL}/tours" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                          Explore More Tours
                        </a>
                      </div>
                      
                      <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
                        <p style="color: #92400e; font-size: 14px; margin: 0;">
                          <strong>Need Immediate Assistance?</strong><br>
                          Contact us at: <a href="mailto:${process.env.EMAIL_ID}" style="color: ${BRAND_COLOR};">${process.env.EMAIL_ID}</a>
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>${BRAND_NAME}</strong><br>
                        Your trusted travel partner
                      </p>
                      <div style="margin-top: 15px;">
                        <a href="${process.env.NEXTAUTH_URL}/contact" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact Us</a>
                        <span style="color: #cccccc;">|</span>
                        <a href="${process.env.NEXTAUTH_URL}/tours" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 12px; margin: 0 10px;">Tours</a>
                        <span style="color: #cccccc;">|</span>
                        <a href="${process.env.NEXTAUTH_URL}" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 12px; margin: 0 10px;">Visit Website</a>
                      </div>
                      <p style="color: #999999; font-size: 12px; margin: 15px 0 0 0;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Enquiry confirmation sent to ${enquiry.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending enquiry confirmation:', error);
    return { success: false, error };
  }
}

// Booking Email Types
interface BookingEmailData {
  bookingRef: string
  guestName: string
  guestEmail: string
  guestPhone: string
  numberOfPeople: number
  selectedDate: string
  departureCity: string
  specialRequests: string | null
  pricePerPerson: number
  totalPrice: number
  status: string
  paymentStatus: string
  package: {
    title: string
    duration: string
    image: string | null
    destination: {
      name: string
    }
  }
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData) {
  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: booking.guestEmail,
    subject: `🎉 Booking Confirmed - ${booking.package.title} | Ref: ${booking.bookingRef}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Booking Confirmed!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Thank you for choosing ${BRAND_NAME}</p>
                    </td>
                  </tr>
                  
                  <!-- Booking Reference -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <div style="background-color: #fff3ef; border-radius: 12px; padding: 20px; text-align: center; border: 2px dashed ${BRAND_COLOR};">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Booking Reference</p>
                        <p style="margin: 8px 0 0; color: ${BRAND_COLOR}; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${booking.bookingRef}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Package Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">📦 Package Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Package</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${booking.package.title}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Destination</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px;">${booking.package.destination.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Duration</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px;">${booking.package.duration}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Trip Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">✈️ Trip Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Travel Date</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.selectedDate}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Departure From</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.departureCity}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Number of Travelers</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.numberOfPeople} Guest${booking.numberOfPeople > 1 ? 's' : ''}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Status</p>
                            <p style="margin: 4px 0 0; color: #28a745; font-size: 14px; font-weight: 600;">✓ ${booking.status}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Price Summary -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">💰 Payment Summary</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 8px 0; color: #666666;">Price per person</td>
                          <td align="right" style="padding: 8px 0; color: #333333;">₹${booking.pricePerPerson.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666666;">Number of guests</td>
                          <td align="right" style="padding: 8px 0; color: #333333;">× ${booking.numberOfPeople}</td>
                        </tr>
                        <tr>
                          <td colspan="2"><hr style="border: none; border-top: 1px solid #eeeeee; margin: 10px 0;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #333333; font-weight: 700; font-size: 18px;">Total Amount</td>
                          <td align="right" style="padding: 8px 0; color: ${BRAND_COLOR}; font-weight: 700; font-size: 24px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 10px;">
                            <span style="background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✓ ${booking.paymentStatus}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXTAUTH_URL}/profile" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View My Bookings
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #666666; font-size: 14px;">
                        Need help? Contact us at 
                        <a href="mailto:${process.env.EMAIL_ID}" style="color: ${BRAND_COLOR}; text-decoration: none;">${process.env.EMAIL_ID}</a>
                      </p>
                      <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${booking.guestEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error };
  }
}

export async function sendAdminNewBookingEmail(booking: BookingEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_ID;

  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: adminEmail,
    subject: `🔔 New Booking: ${booking.package.title} - ₹${booking.totalPrice.toLocaleString('en-IN')} | Ref: ${booking.bookingRef}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Alert</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔔 New Booking Received!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">A new booking has been made</p>
                    </td>
                  </tr>
                  
                  <!-- Booking Reference -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <div style="background-color: #e8f5e9; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #28a745;">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Booking Reference</p>
                        <p style="margin: 8px 0 0; color: #28a745; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${booking.bookingRef}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Customer Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">👤 Customer Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Name</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${booking.guestName}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Email</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 16px;"><a href="mailto:${booking.guestEmail}" style="color: ${BRAND_COLOR}; text-decoration: none;">${booking.guestEmail}</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Phone</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 16px;"><a href="tel:${booking.guestPhone}" style="color: ${BRAND_COLOR}; text-decoration: none;">${booking.guestPhone}</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Package Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">📦 Booking Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Package</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.title}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Destination</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.destination.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Travel Date</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.selectedDate}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Departure</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.departureCity}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Guests</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.numberOfPeople} Guest${booking.numberOfPeople > 1 ? 's' : ''}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Duration</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.duration}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  ${booking.specialRequests ? `
                  <!-- Special Requests -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">📝 Special Requests</h2>
                      <p style="margin: 0; color: #666666; font-size: 14px; background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">${booking.specialRequests}</p>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Revenue Summary -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <div style="background-color: #e8f5e9; border-radius: 12px; padding: 20px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="color: #333333; font-weight: 700; font-size: 18px;">Total Revenue</td>
                            <td align="right" style="color: #28a745; font-weight: 700; font-size: 28px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 10px;">
                              <span style="background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✓ ${booking.paymentStatus}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXTAUTH_URL}/admin/bookings" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View in Admin Panel
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. Admin Notification.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}

// Pending Payment Booking Email (when Razorpay is disabled)
interface PendingPaymentBookingData extends BookingEmailData {
  roomSelection?: string | null
  roomTotalPrice?: number
}

export async function sendAdminPendingPaymentEmail(booking: PendingPaymentBookingData) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_ID;

  // Parse room selection if available
  let roomSelectionHTML = '';
  if (booking.roomSelection) {
    try {
      const rooms = JSON.parse(booking.roomSelection);
      const ROOM_TYPE_LABELS: Record<number, string> = {
        1: "Single Room (1 Person)",
        2: "Double Room (2 Persons)",
        3: "Triple Room (3 Persons)",
        4: "Quad Room (4 Persons)"
      };

      roomSelectionHTML = `
        <tr>
          <td style="padding: 10px 30px 20px;">
            <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">🛏️ Room Selection</h2>
            <table width="100%" cellspacing="0" cellpadding="0">
              ${rooms.map((room: { roomType: number; count: number; pricePerRoom: number }) => `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                    <p style="margin: 0; color: #666666; font-size: 12px;">${ROOM_TYPE_LABELS[room.roomType]}</p>
                    <p style="margin: 4px 0 0; color: #333333; font-size: 14px;">
                      ${room.count} × ₹${room.pricePerRoom.toLocaleString('en-IN')} = ₹${(room.count * room.pricePerRoom).toLocaleString('en-IN')}
                    </p>
                  </td>
                </tr>
              `).join('')}
              ${booking.roomTotalPrice ? `
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #333333; font-weight: 600; font-size: 16px;">
                      Room Total: ₹${booking.roomTotalPrice.toLocaleString('en-IN')}
                    </p>
                  </td>
                </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      `;
    } catch (e) {
      console.error('Error parsing room selection:', e);
    }
  }

  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: adminEmail,
    subject: `💰 PAYMENT PENDING: ${booking.package.title} - ₹${booking.totalPrice.toLocaleString('en-IN')} | Ref: ${booking.bookingRef}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pending Payment Booking</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">💰 Payment Pending - Action Required!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">New booking awaiting payment collection</p>
                    </td>
                  </tr>
                  
                  <!-- Alert Box -->
                  <tr>
                    <td style="padding: 20px 30px;">
                      <div style="background-color: #fff3cd; border: 2px solid #ff9800; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="margin: 0; color: #856404; font-weight: 600; font-size: 16px;">⚠️ Customer booking created - Please contact to collect payment</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Booking Reference -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <div style="background-color: #fff3ef; border-radius: 12px; padding: 20px; text-align: center; border: 2px dashed ${BRAND_COLOR};">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Booking Reference</p>
                        <p style="margin: 8px 0 0; color: ${BRAND_COLOR}; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${booking.bookingRef}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Customer Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">👤 Customer Contact Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Name</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${booking.guestName}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Email</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 16px;"><a href="mailto:${booking.guestEmail}" style="color: ${BRAND_COLOR}; text-decoration: none;">${booking.guestEmail}</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Phone (Call to collect payment)</p>
                            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700;"><a href="tel:${booking.guestPhone}" style="color: #28a745; text-decoration: none;">📞 ${booking.guestPhone}</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Package Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">📦 Booking Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Package</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.title}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Destination</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.destination.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Travel Date</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.selectedDate}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Departure</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.departureCity}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Guests</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.numberOfPeople} Guest${booking.numberOfPeople > 1 ? 's' : ''}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Duration</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.package.duration}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  ${roomSelectionHTML}
                  
                  ${booking.specialRequests ? `
                  <!-- Special Requests -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">📝 Special Requests</h2>
                      <p style="margin: 0; color: #666666; font-size: 14px; background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; white-space: pre-wrap;">${booking.specialRequests}</p>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Payment to Collect -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <div style="background-color: #fff3cd; border: 3px solid #ff9800; border-radius: 12px; padding: 25px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="color: #333333; font-weight: 700; font-size: 20px;">💰 Amount to Collect</td>
                            <td align="right" style="color: #ff9800; font-weight: 700; font-size: 32px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 15px;">
                              <div style="background-color: #fff; border-radius: 8px; padding: 15px; margin-top: 10px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                  <strong>Payment Status:</strong> 🔴 PENDING<br>
                                  <strong>Action Required:</strong> Please contact the customer to collect payment<br>
                                  <strong>Price Breakdown:</strong><br>
                                  • Tour: ₹${booking.pricePerPerson.toLocaleString('en-IN')} × ${booking.numberOfPeople} = ₹${(booking.pricePerPerson * booking.numberOfPeople).toLocaleString('en-IN')}
                                  ${booking.roomTotalPrice ? `<br>• Rooms: ₹${booking.roomTotalPrice.toLocaleString('en-IN')}` : ''}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="tel:${booking.guestPhone}" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: #ffffff; text-decoration: none; padding: 16px 35px; border-radius: 8px; font-weight: 600; font-size: 18px; margin-right: 10px;">
                              📞 Call Customer
                            </a>
                            <a href="mailto:${booking.guestEmail}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 16px 35px; border-radius: 8px; font-weight: 600; font-size: 18px; margin-right: 10px;">
                              📧 Email Customer
                            </a>
                            <a href="${process.env.NEXTAUTH_URL}/admin/bookings" style="display: inline-block; background-color: #6c757d; color: #ffffff; text-decoration: none; padding: 16px 35px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                              View in Admin
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. Pending Payment Notification.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Pending payment notification sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending pending payment notification:', error);
    return { success: false, error };
  }
}

export async function sendCustomerPendingPaymentEmail(booking: PendingPaymentBookingData) {
  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: booking.guestEmail,
    subject: `📋 Booking Received - ${booking.package.title} | Ref: ${booking.bookingRef}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📋 Booking Received!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Thank you for choosing ${BRAND_NAME}</p>
                    </td>
                  </tr>
                  
                  <!-- Booking Reference -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <div style="background-color: #fff3ef; border-radius: 12px; padding: 20px; text-align: center; border: 2px dashed ${BRAND_COLOR};">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Booking Reference</p>
                        <p style="margin: 8px 0 0; color: ${BRAND_COLOR}; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${booking.bookingRef}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Important Notice -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.6;">
                          <strong>📞 Next Steps:</strong><br>
                          Our team will contact you shortly via phone or email to confirm your booking and collect payment details. Please keep your phone handy!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Package Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">📦 Your Booking Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Package</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${booking.package.title}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Destination</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px;">${booking.package.destination.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Duration</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px;">${booking.package.duration}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Trip Details -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">✈️ Trip Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Travel Date</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.selectedDate}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Departure From</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.departureCity}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Number of Travelers</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${booking.numberOfPeople} Guest${booking.numberOfPeople > 1 ? 's' : ''}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Status</p>
                            <p style="margin: 4px 0 0; color: #ff9800; font-size: 14px; font-weight: 600;">⏳ Pending Confirmation</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Price Summary -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">💰 Amount Payable</h2>
                      <div style="background-color: #fff3ef; border-radius: 12px; padding: 20px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding: 8px 0; color: #666666;">Price per person</td>
                            <td align="right" style="padding: 8px 0; color: #333333;">₹${booking.pricePerPerson.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #666666;">Number of guests</td>
                            <td align="right" style="padding: 8px 0; color: #333333;">× ${booking.numberOfPeople}</td>
                          </tr>
                          ${booking.roomTotalPrice ? `
                          <tr>
                            <td style="padding: 8px 0; color: #666666;">Room charges</td>
                            <td align="right" style="padding: 8px 0; color: #333333;">₹${booking.roomTotalPrice.toLocaleString('en-IN')}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td colspan="2"><hr style="border: none; border-top: 1px solid #eeeeee; margin: 10px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 700; font-size: 18px;">Total Amount</td>
                            <td align="right" style="padding: 8px 0; color: ${BRAND_COLOR}; font-weight: 700; font-size: 24px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Contact Info -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 20px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #1b5e20; font-size: 14px; line-height: 1.6;">
                          <strong>Have questions?</strong><br>
                          Contact us at: <a href="mailto:${process.env.EMAIL_ID}" style="color: ${BRAND_COLOR};">${process.env.EMAIL_ID}</a><br>
                          We're here to help make your trip unforgettable!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #666666; font-size: 14px;">
                        Need help? Contact us at 
                        <a href="mailto:${process.env.EMAIL_ID}" style="color: ${BRAND_COLOR}; text-decoration: none;">${process.env.EMAIL_ID}</a>
                      </p>
                      <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Pending payment confirmation sent to ${booking.guestEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending customer pending payment email:', error);
    return { success: false, error };
  }
}

export async function sendContactNotification(contactData: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const mailOptions = {
    from: `"${BRAND_NAME} Contact Form" <${process.env.EMAIL_ID}>`,
    to: process.env.EMAIL_ID,
    subject: `New Contact Form Submission from ${contactData.fullName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">New Contact Form Submission</h2>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f8fafb; border-left: 4px solid ${BRAND_COLOR};">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${contactData.fullName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${contactData.phone}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <strong style="color: #333;">Message:</strong>
              <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This email was sent from the ${BRAND_NAME} contact form.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact notification:', error);
    return { success: false, error };
  }
}

// Brochure Request Email
interface BrochureRequestData {
  email: string;
  packageId: number;
  packageName: string;
  needsCallback: boolean;
  brochureUrl?: string | null;
}

export async function sendBrochureRequestEmail(data: BrochureRequestData) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_ID;

  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: adminEmail,
    subject: `📄 Brochure Download Request: ${data.packageName}${data.needsCallback ? ' [CALLBACK REQUESTED]' : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brochure Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📄 Brochure Download Request</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">A potential customer is interested in your tour</p>
                    </td>
                  </tr>
                  
                  ${data.needsCallback ? `
                  <!-- Callback Alert -->
                  <tr>
                    <td style="padding: 20px 30px 0;">
                      <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; text-align: center;">
                        <p style="margin: 0; color: #856404; font-weight: 600;">📞 Customer has requested a callback!</p>
                      </div>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Lead Details -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">👤 Lead Details</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Email Address</p>
                            <p style="margin: 4px 0 0; font-size: 16px;">
                              <a href="mailto:${data.email}" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">${data.email}</a>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Interested In</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${data.packageName}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Package ID</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px;">${data.packageId}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Callback Requested</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">
                              ${data.needsCallback ? '✅ Yes - Please call' : '❌ No'}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Action Buttons -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="mailto:${data.email}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                              Send Email
                            </a>
                            <a href="${process.env.NEXTAUTH_URL}/admin/packages/${data.packageId}/edit" style="display: inline-block; background-color: #6c757d; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Package
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. Lead Notification.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Brochure request notification sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending brochure request notification:', error);
    return { success: false, error };
  }
}

// Coupon Email
interface CouponEmailData {
  email: string;
  couponCode: string;
  discountPercent: number;
  expiresAt: Date;
  packageName?: string;
}

export async function sendCouponEmail(data: CouponEmailData) {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: data.email,
    subject: `🎉 Your Exclusive ${data.discountPercent}% Discount Coupon - ${BRAND_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Exclusive Discount</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Your Exclusive Discount!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Thank you for downloading our brochure</p>
                    </td>
                  </tr>
                  
                  <!-- Coupon Box -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <p style="color: #666666; font-size: 16px; margin: 0 0 10px;">Your exclusive coupon code:</p>
                        <div style="background: linear-gradient(135deg, #fff3ef 0%, #ffe8e0 100%); border: 3px dashed ${BRAND_COLOR}; border-radius: 12px; padding: 25px; display: inline-block;">
                          <p style="margin: 0; color: ${BRAND_COLOR}; font-size: 32px; font-weight: 700; letter-spacing: 4px;">${data.couponCode}</p>
                        </div>
                      </div>
                      
                      <!-- Discount Details -->
                      <div style="background-color: #f8fafb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="text-align: center; padding: 10px;">
                              <p style="margin: 0; color: #666666; font-size: 14px;">Discount</p>
                              <p style="margin: 5px 0 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700;">${data.discountPercent}% OFF</p>
                            </td>
                            <td style="text-align: center; padding: 10px; border-left: 1px solid #e0e0e0;">
                              <p style="margin: 0; color: #666666; font-size: 14px;">Valid Until</p>
                              <p style="margin: 5px 0 0; color: #333333; font-size: 18px; font-weight: 600;">${expiryDate}</p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      ${data.packageName ? `
                      <!-- Package Info -->
                      <div style="background-color: #fff3ef; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #666666; font-size: 14px;">This coupon is for:</p>
                        <p style="margin: 5px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${data.packageName}</p>
                      </div>
                      ` : ''}
                      
                      <!-- How to Use -->
                      <div style="margin-bottom: 25px;">
                        <h3 style="color: #333333; margin: 0 0 15px; font-size: 16px;">How to use your coupon:</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                          <li>Browse and select your desired tour package</li>
                          <li>Proceed to checkout</li>
                          <li>Enter the coupon code <strong style="color: ${BRAND_COLOR};">${data.couponCode}</strong></li>
                          <li>Enjoy your ${data.discountPercent}% discount!</li>
                        </ol>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center;">
                        <a href="${process.env.NEXTAUTH_URL}/tours" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Explore Tours & Book Now
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Terms -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px;">
                        <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                          * This coupon is valid for one-time use only. Cannot be combined with other offers.
                          <br>Valid until ${expiryDate}. Terms and conditions apply.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #666666; font-size: 14px;">
                        <strong>${BRAND_NAME}</strong><br>
                        Your trusted travel partner
                      </p>
                      <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Coupon email sent to ${data.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending coupon email:', error);
    return { success: false, error };
  }
}

// Trip Plan Email to Expert
interface TripPlanEmailData {
  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  // Trip Details
  country: string;
  groupType: string;
  adultsCount: number;
  childrenCount: number;
  dateType: string;
  startDate?: string;
  endDate?: string;
  preferredMonth?: string;
  tripDuration?: string;
  ageGroup: string;
  tourType: string;
  accommodation: string;
  budgetPerPerson: string;
  budgetFlexible: string;
  planningStage: string;
  tripTitle?: string;
  tripDescription: string;

  // Expert Info
  expertName: string;
  expertEmail: string;
}

export async function sendTripPlanToExpert(data: TripPlanEmailData) {
  const totalTravelers = data.groupType === 'single' ? 1 :
    data.groupType === 'couple' ? 2 :
      data.adultsCount + data.childrenCount;

  const travelDates = data.dateType === 'exact'
    ? `${data.startDate} to ${data.endDate}`
    : data.dateType === 'approximate'
      ? `Preferred: ${data.preferredMonth} (${data.tripDuration})`
      : `Duration: ${data.tripDuration || 'TBD'}`;

  const mailOptions = {
    from: `"${BRAND_NAME} Trip Request" <${process.env.EMAIL_ID}>`,
    to: data.expertEmail,
    replyTo: data.customerEmail,
    subject: `🌍 New Customized Trip Request: ${data.country} | ${totalTravelers} Traveler${totalTravelers > 1 ? 's' : ''} | From: ${data.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Trip Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🌍 New Trip Request!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">A customer wants a customized trip to ${data.country}</p>
                    </td>
                  </tr>
                  
                  <!-- Customer Details -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">👤 Customer Information</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Name</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${data.customerName}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Email</p>
                            <p style="margin: 4px 0 0;"><a href="mailto:${data.customerEmail}" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 16px;">${data.customerEmail}</a></p>
                          </td>
                        </tr>
                        ${data.customerPhone ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Phone</p>
                            <p style="margin: 4px 0 0;"><a href="tel:${data.customerPhone}" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 16px;">${data.customerPhone}</a></p>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Trip Overview -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">✈️ Trip Overview</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Destination</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${data.country}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Group Type</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${data.groupType.charAt(0).toUpperCase() + data.groupType.slice(1)}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">No. of Travelers</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">
                              ${data.adultsCount} Adult${data.adultsCount > 1 ? 's' : ''}${data.childrenCount > 0 ? `, ${data.childrenCount} Child${data.childrenCount > 1 ? 'ren' : ''}` : ''}
                            </p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Age Group</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${data.ageGroup}</p>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Travel Dates</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${travelDates}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Preferences -->
                  <tr>
                    <td style="padding: 10px 30px 20px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">⚙️ Preferences</h2>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Tour Type</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${data.tourType}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Accommodation</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px; font-weight: 600;">${data.accommodation}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 10px 10px 10px 0; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Budget Per Person</p>
                            <p style="margin: 4px 0 0; color: ${BRAND_COLOR}; font-size: 14px; font-weight: 600;">${data.budgetPerPerson}</p>
                          </td>
                          <td width="50%" style="padding: 10px 0 10px 10px; border-bottom: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Budget Flexibility</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px;">${data.budgetFlexible}</p>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 10px 0;">
                            <p style="margin: 0; color: #666666; font-size: 12px;">Planning Stage</p>
                            <p style="margin: 4px 0 0; color: #333333; font-size: 14px;">${data.planningStage}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  ${data.tripTitle ? `
                  <!-- Trip Title -->
                  <tr>
                    <td style="padding: 10px 30px;">
                      <div style="background-color: #fff3ef; border-left: 4px solid ${BRAND_COLOR}; padding: 15px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #666666; font-size: 12px;">Trip Name</p>
                        <p style="margin: 4px 0 0; color: #333333; font-size: 16px; font-weight: 600;">${data.tripTitle}</p>
                      </div>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Trip Description -->
                  <tr>
                    <td style="padding: 20px 30px;">
                      <h2 style="color: #333333; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">💬 Customer's Description</h2>
                      <p style="margin: 0; color: #666666; font-size: 14px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.6; white-space: pre-wrap;">${data.tripDescription}</p>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 10px 30px 30px;">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="mailto:${data.customerEmail}?subject=Re: Your ${data.country} Trip Request" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                              Reply to Customer
                            </a>
                            ${data.customerPhone ? `
                            <a href="tel:${data.customerPhone}" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Call Customer
                            </a>
                            ` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        This trip request was submitted via ${BRAND_NAME} Trip Planner.<br>
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Trip plan sent to expert ${data.expertName} at ${data.expertEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending trip plan to expert:', error);
    return { success: false, error };
  }
}

// Password Reset Email
interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const mailOptions = {
    from: `"${BRAND_NAME}" <${process.env.EMAIL_ID}>`,
    to: data.email,
    subject: `Reset Your Password - ${BRAND_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 Reset Your Password</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">We received a request to reset your password</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; margin: 0 0 20px;">Hi ${data.name},</p>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                        We received a request to reset your password for your ${BRAND_NAME} account. Click the button below to create a new password:
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                          Reset Password
                        </a>
                      </div>
                      
                      <div style="background-color: #fff3ef; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #666666; font-size: 14px; margin: 0;">
                          <strong>⏰ This link will expire in 1 hour.</strong><br>
                          If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </div>
                      
                      <p style="color: #999999; font-size: 14px; margin: 25px 0 0;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${data.resetUrl}" style="color: ${BRAND_COLOR}; word-break: break-all;">${data.resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${data.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
