'use server';

import { Resend } from 'resend';
import { adminDb } from './firebaseAdmin'; // Firestore Admin SDK

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// ✅ EMAIL SUBSCRIBE ACTION
// ============================================================
export const subscribeEmail = async (email: string) => {
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  try {
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
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Thank you for subscribing!</h1>
          <p>You're officially on the waitlist for Flames Summit 2026.</p>
          <p>Stay tuned for updates, early-bird tickets, and behind-the-scenes insights!</p>
          <p>Get ready to BUILD For BHARAT!</p>
          <br/>
          <p>Warm regards,<br/>Team Flames Summit India 2026</p>
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
    console.error('Action Error:', error);
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
  approved: boolean;
  timestamp?: string;
  [key: string]: any; // Allow other properties
}

export interface VolunteerDataWithId extends Omit<VolunteerApplicationData, 'id'> {
  id: string;
}

// ✅ Check if email or phone already exists in Firestore
export const checkVolunteerUniqueness = async (email: string, phone: string) => {
  try {
    const emailQuery = await adminDb
      .collection('volunteers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      return { success: false, field: 'email', message: 'This email is already registered.' };
    }

    const phoneQuery = await adminDb
      .collection('volunteers')
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (!phoneQuery.empty) {
      return { success: false, field: 'phone', message: 'This phone number is already registered.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error checking uniqueness:', error);
    return { success: false, message: 'Failed to validate uniqueness.' };
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
      approved: false,
      timestamp: new Date().toISOString(),
    };

    await adminDb.collection('volunteers').add(submissionData);

    const firstName = fullname.split(' ')[0] || 'there';

    await resend.emails.send({
      from: 'Flames Summit <hello@flamessummit.org>',
      to: email,
      subject: "We've Received Your Volunteer Application! 🔥",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
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

// ✅ Get all volunteers (default: latest 10)
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
  [key: string]: any; // Allow other properties
};

export const getVolunteers = async (limitCount: number = 10): Promise<Volunteer[]> => {
  try {
    const snapshot = await adminDb
      .collection('volunteers')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      fullname: doc.get('fullname') || '',
      email: doc.get('email') || '',
      phone: doc.get('phone') || '',
      linkedin: doc.get('linkedin') || '',
      role: doc.get('role') || '',
      customRole: doc.get('customRole') || '',
      whyJoin: doc.get('whyJoin') || '',
      approved: doc.get('approved') || false,
      timestamp: doc.get('timestamp') || new Date().toISOString(),
      ...doc.data()
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

const buildApprovalEmailHTML = (firstName: string, role: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
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
    // 1) Read the volunteer to get email/name/role
    const docRef = adminDb.collection('volunteers').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return { success: false, error: 'Volunteer not found.' };
    }

    const data = snap.data() as {
      fullname?: string;
      email?: string;
      role?: string;
      [k: string]: any;
    };

    const fullname = (data?.fullname || '').trim();
    const firstName = fullname.split(' ')[0] || 'there';
    const email = (data?.email || '').trim();
    const role = (data?.role || 'Volunteer').trim();

    // 2) Approve in Firestore
    await docRef.update({
      approved: true,
      timestamp: new Date().toISOString(),
    });

    // 3) Send approval email (non-blocking for the approval result)
    if (email) {
      try {
        await resend.emails.send({
          from: 'Flames Summit <hello@flamessummit.org>',
          to: email,
          subject: 'You’re Approved! Welcome to the Flames Summit Team 🔥',
          html: buildApprovalEmailHTML(firstName, role),
        });
      } catch (mailErr) {
        console.warn(`Approved ${id} but failed to send email to ${email}:`, mailErr);
        // Still return success since the approval itself worked
        return {
          success: true,
          warning: 'Approved, but email could not be sent.',
        };
      }
    } else {
      console.warn(`Approved ${id} but no email present on document.`);
      return {
        success: true,
        warning: 'Approved, but no email on file.',
      };
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
      timestamp: new Date().toISOString(),
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
