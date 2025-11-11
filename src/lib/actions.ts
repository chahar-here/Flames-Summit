'use server';

import { Resend } from 'resend';
// ✅ CORRECT: Import the SECURE Admin DB
import { adminDb } from './firebaseAdmin'; 

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// ✅ EMAIL SUBSCRIBE ACTION
// ============================================================

/**
 * Tries to extract a formatted name from an email address.
 */

export const subscribeEmail = async (email: string) => {
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }


  try {
    // ✅ CORRECT: Use adminDb
    const subscriberRef = adminDb.collection('subscribers').doc(email);
    const doc = await subscriberRef.get();

    if (doc.exists) {
      return { success: false, error: "You're already on the list!" };
    }

    await subscriberRef.set({
      email,
      subscribedAt: new Date().toISOString(),
      source: 'waitlist',
    });

    await resend.emails.send({
      from: 'Flames Summit <hello@flamessummit.org>',
      to: email,
      subject: 'Welcome to the Flames Summit Waitlist! 🔥',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
          <img 
            src="https://www.flamessummit.org/email-banner.png" 
            alt="Flames Summit Banner" 
            style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;" 
          />
          <h1 style="color: #333;">Hey Folk,</h1>
          <p style="color: #555;">Thank you for subscribing!</p>
          <p style="color: #555;">You're officially on the waitlist for Flames Summit 2026.</p>
          <p style="color: #555;">Stay tuned for updates, early-bird tickets, and behind-the-scenes insights!</p>
          <br/>
          <p style="color: #555;">Warm regards,<br/>Team Flames Summit India 2026</p>
          <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;" />
          <div style="text-align:center;font-size:12px;color:#777;">
            <p>Follow us:</p>
            <a href="https://www.instagram.com/flamessummitindia/" style="margin:0 10px;color:#E1306C;font-weight:bold;">Instagram</a>
            <a href="https://www.linkedin.com/company/flamessummitindia/" style="margin:0 10px;color:#0077b5;font-weight:bold;">LinkedIn</a>
            <a href="https://x.com/flamessummit" style="margin:0 10px;color:#1DA1F2;font-weight:bold;">X (Twitter)</a>
          </div>
        </div>
      `,
    });

    return { success: true, message: 'Success! Check your email to confirm.' };
  } catch (error) {
    console.error('Subscribe Action Error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
};

// ============================================================
// ✅ VOLUNTEER APPLICATION FUNCTIONS
// ============================================================
export interface VolunteerApplicationData {
  id?: string;
  fullname: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  customRole: string;
  whyJoin: string;
  approved: boolean; // Server will set this
  timestamp?: string;
  [key: string]: any; 
}

// ✅ Check if email or phone already exists in Firestore
export const checkVolunteerUniqueness = async (email: string, phone: string) => {
  try {
    // ✅ CORRECT: Use adminDb
    const emailQuery = await adminDb
      .collection('volunteers')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      return { success: false, field: 'email', message: 'This email is already registered.' };
    }

    // ✅ CORRECT: Use adminDb
    const phoneQuery = await adminDb
      .collection('volunteers')
      .where('phone', '==', phone) // You can add normalization here if needed
      .limit(1)
      .get();

    if (!phoneQuery.empty) {
      return { success: false, field: 'phone', message: 'This phone number is already registered.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error checking uniqueness:', error);
    return { success: false, message: 'Server validation failed. Please try again.' };
  }
};


// ✅ Submit new volunteer form
export const submitVolunteerForm = async (formData: VolunteerApplicationData) => {
  const { fullname, email, role, whyJoin } = formData;

  if (!fullname || !email || !role || !whyJoin) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    const submissionData = {
      ...formData,
      email: formData.email.toLowerCase().trim(),
      approved: false, // Server sets this
      timestamp: new Date().toISOString(),
    };

    // ✅ CORRECT: Use adminDb
    await adminDb.collection('volunteers').add(submissionData);

    const firstName = fullname.split(' ')[0] || 'there';

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
          <p>Thank you for applying to be a volunteer at Flames Summit India!</p>
          <p>We've successfully received your application for the <strong>${role}</strong> role.</p>
          <p>Our team will review your application and get back to you soon with the next steps.</p>
          <br/>
          <p>The Flames Summit Team</p>
          <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;" />
          <div style="text-align:center;font-size:12px;color:#777;">
            <p>Follow us for updates:</p>
            <a href="https://www.instagram.com/flamessummitindia/" style="margin:0 10px;color:#E1306C;font-weight:bold;">Instagram</a>
            <a href="https://www.linkedin.com/company/flamessummitindia/" style="margin:0 10px;color:#0077b5;font-weight:bold;">LinkedIn</a>
            <a href="https://x.com/flamessummit" style="margin:0 10px;color:#1DA1F2;font-weight:bold;">X (Twitter)</a>
          </div>
        </div>
      `,
    });

    return { success: true, message: 'Application submitted successfully!' };
  } catch (error) {
    console.error('Error in submitVolunteerForm:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
};

// ============================================================
// ✅ ADMIN PANEL FUNCTIONS
// ============================================================
export type Volunteer = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  customRole: string;
  whyJoin: string;
  approved: boolean;
  timestamp?: string;
  [key: string]: any; 
};

// ✅ Get all volunteers
export const getVolunteers = async (limitCount: number = 25): Promise<Volunteer[]> => {
  try {
    const snapshot = await adminDb
      .collection('volunteers')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Volunteer));
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }
};

// ✅ Update volunteer details
export const updateVolunteer = async (id: string, updatedData: Partial<VolunteerApplicationData>) => {
  try {
    await adminDb.collection('volunteers').doc(id).update(updatedData);
    return { success: true };
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return { success: false, error: 'Failed to update volunteer.' };
  }
};

// --- Approval Email HTML ---
const buildApprovalEmailHTML = (firstName: string, role: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
    <img 
      src="https://www.flamessummit.org/email-banner.png" 
      alt="Flames Summit Banner" 
      style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;" 
    />
    <h1 style="color: #333;">You're in, ${firstName}! 🔥</h1>
    <p>Congrats — your application for <strong>${role}</strong> has been <strong>approved</strong> for Flames Summit India.</p>
    <p>We're excited to have you on the team. We'll follow up soon with onboarding details, timelines, and next steps.</p>
    <p>In the meantime, feel free to say hi on our socials and spread the word!</p>
    <br/>
    <p>- Team Flames Summit India 2026</p>
    <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;" />
    <div style="text-align:center;font-size:12px;color:#777;">
      <p>Follow us:</p>
      <a href="https://www.instagram.com/flamessummitindia/" style="margin:0 10px;color:#E1306C;font-weight:bold;">Instagram</a>
      <a href="https://www.linkedin.com/company/flamessummitindia/" style="margin:0 10px;color:#0077b5;font-weight:bold;">LinkedIn</a>
      <a href="https://x.com/flamessummit" style="margin:0 10px;color:#1DA1F2;font-weight:bold;">X (Twitter)</a>
    </div>
  </div>
`;

// ✅ Approve volunteer
export const approveVolunteer = async (id: string) => {
  try {
    const docRef = adminDb.collection('volunteers').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return { success: false, error: 'Volunteer not found.' };
    }

    const data = snap.data() as Volunteer;
    const firstName = (data?.fullname || '').split(' ')[0] || 'there';
    const email = (data?.email || '').trim();
    const role = (data?.role || 'Volunteer').trim();

    await docRef.update({
      approved: true,
    });

    if (email) {
      await resend.emails.send({
        from: 'Flames Summit <hello@flamessummit.org>',
        to: email,
        subject: 'You’re Approved! Welcome to the Flames Summit Team 🔥',
        html: buildApprovalEmailHTML(firstName, role),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving volunteer:', error);
    return { success: false, error: 'Failed to approve volunteer.' };
  }
};

// ✅ Unapprove volunteer
export const unapproveVolunteer = async (id: string) => {
  try {
    await adminDb.collection('volunteers').doc(id).update({
      approved: false,
    });
    return { success: true };
  } catch (error) {
    console.error('Error unapproving volunteer:', error);
    return { success: false, error: 'Failed to unapprove volunteer.' };
  }
};

// ✅ Delete volunteer
export const deleteVolunteer = async (id: string) => {
  try {
    await adminDb.collection('volunteers').doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return { success: false, error: 'Failed to delete volunteer.' };
  }
};