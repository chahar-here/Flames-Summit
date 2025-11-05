'use server';

import { Resend } from 'resend';
import { adminDb } from './firebaseAdmin'; // Use the server-side admin DB

const resend = new Resend(process.env.RESEND_API_KEY);

// Subscribe email action
export const subscribeEmail = async (email: string) => {
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  try {
    const subscriberRef = adminDb.collection('subscribers').doc(email);
    const doc = await subscriberRef.get();

    // 1. Check if user is already subscribed
    if (doc.exists) {
      return { success: false, error: "You're already on the list!" };
    }

    // 2. Save new subscriber to Firestore
    await subscriberRef.set({
      email: email,
      subscribedAt: new Date().toISOString(),
      source: 'waitlist',
    });

    // 3. Send welcome email with social links
    await resend.emails.send({
      from: 'Flames Summit <hello@flamessummit.org>',
      to: email,
      subject: 'Welcome to the Flames Summit Waitlist! 🔥',
      
      // --- MODIFIED HTML BLOCK ---
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <img 
            src="https://www.flamessummit.org/email-banner.png" 
            alt="Flames Summit Banner" 
            style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;" 
          />
          
          <h1>Thank you for subscribing!</h1>
          <p>You're officially on the waitlist for Flames Summit 2026.</p>
          <p>Stay tuned: we’ll keep you updated with the latest news, including speaker announcements, early-bird ticket releases, and exclusive behind-the-scenes insights.</p>
          <p>Get ready to BUILD For BHARAT !</p>
          <br/>
          <p>Warm regards,
          <br/>
          Team Flames Summit India 2026</p>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          
          <div style="text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0 0 10px 0;">Follow us for the latest updates:</p>
            <a 
              href="https://www.instagram.com/flamessummitindia/" 
              style="margin: 0 10px; text-decoration: none; color: #E1306C; font-weight: bold;"
            >
              Instagram
            </a>
            <a 
              href="https://www.linkedin.com/company/flamessummitindia/" 
              style="margin: 0 10px; text-decoration: none; color: #0077b5; font-weight: bold;"
            >
              LinkedIn
            </a>
            <a 
              href="https://x.com/flamessummit" 
              style="margin: 0 10px; text-decoration: none; color: #1DA1F2; font-weight: bold;"
            >
              X (Twitter)
            </a>
          </div>
        </div>
      `,
      // --- END OF MODIFIED HTML BLOCK ---
    });

    return { success: true, message: 'Success! Check your email to confirm.' };
  } catch (error) {
    console.error('Action Error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
};
// 
export interface VolunteerApplicationData {
  fullname: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string; // This will be the final role (e.g., "Web Developer" or the custom text)
  whyJoin: string;
}
// --- THIS IS THE NEW SERVER ACTION FOR Volunteer application ---
export const submitVolunteerForm = async (formData: VolunteerApplicationData) => {
  const { fullname, email, role, whyJoin } = formData;

  // 1. Basic server-side validation
  if (!fullname || !email || !role || !whyJoin) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    // 2. Save to Firestore using the secure Admin SDK
    const submissionData = {
      ...formData,
      timestamp: new Date().toISOString(),
    };
    await adminDb.collection('volunteers').add(submissionData);

    // 3. Send the confirmation email
    const firstName = fullname.split(' ')[0] || 'there'; // Get first name

    await resend.emails.send({
      from: 'Flames Summit <hello@flamessummit.org>',
      to: email,
      subject: "We've Received Your Volunteer Application! 🔥",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
          <img 
            src="https://www.flamessummit.org/email-banner.png" 
            alt="Flames Summit Banner" 
            style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;" 
          />
          <h1 style="color: #333;">Hey ${firstName},</h1>
          <p style="color: #555;">Thank you for applying to be a volunteer at Flames Summit India!</p>
          <p style="color: #555;">We've successfully received your application for the <strong>${role}</strong> role.</p>
          <p style="color: #555;">Our team will review your application and get back to you soon with the next steps.</p>
          <br/>
          <p style="color: #555;">The Flames Summit Team</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <div style="text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0 0 10px 0;">Follow us for updates:</p>
            <a href="https://www.instagram.com/flamessummitindia/" style="margin: 0 10px; text-decoration: none; color: #E1306C; font-weight: bold;">Instagram</a>
            <a href="https://www.linkedin.com/company/flamessummitindia/" style="margin: 0 10px; text-decoration: none; color: #0077b5; font-weight: bold;">LinkedIn</a>
            <a href="https://x.com/flamessummit" style="margin: 0 10px; text-decoration: none; color: #1DA1F2; font-weight: bold;">X (Twitter)</a>
          </div>
        </div>
      `,
    });

    // 4. Return success
    return { success: true, message: 'Application submitted successfully!' };
  } catch (error) {
    console.error('Action Error (submitVolunteerForm):', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
};