import crypto from 'crypto';
import logger from '../../utils/logger';
import { sendEmail } from '../email-service';

/**
 * ✅ FIX #10: Secure Email Tracking Service
 * 
 * Prevents unauthorized access to application tracking by requiring email verification tokens.
 * Tokens expire after 24 hours for security.
 */

interface EmailToken {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In production, use Redis instead of Map for distributed systems
// For now, using in-memory Map - tokens are temporary
const emailTokens = new Map<string, EmailToken>();

/**
 * Generate secure tracking link and send to applicant's email
 * 
 * @param email - Applicant's email address
 * @param propertyId - Optional: property they applied for
 * @returns Success message with token
 */
export async function sendTrackingLink(email: string, propertyId?: string): Promise<{ success: boolean; message: string }> {
  try {
    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token with expiration
    emailTokens.set(email, {
      email,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    logger.info(`✅ Generated tracking token for ${email}`);

    // Build secure tracking URL
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-application?token=${token}&email=${encodeURIComponent(email)}`;

    // Email template with tracking link
    const template = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">Track Your Application</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for submitting your property application! You can track the status of your application using the link below.
          </p>
          
          <div style="margin: 25px 0;">
            <a href="${trackingUrl}" style="
              padding: 12px 24px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
              font-weight: bold;
            ">
              View Application Status
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px;">
            <strong>Security Note:</strong> This link is unique to your email and expires in 24 hours.<br/>
            For security reasons, do not share this link with others.
          </p>
          
          ${propertyId ? `<p style="color: #666; font-size: 14px;">Property ID: ${propertyId}</p>` : ''}
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            If you did not submit this application, please ignore this email.<br/>
            If you have questions, contact our support team.
          </p>
        </div>
      </div>
    `;

    // Send email
    await sendEmail(email, 'Track Your Property Application', template);

    return {
      success: true,
      message: 'Tracking link sent to your email',
    };
  } catch (error) {
    logger.error('❌ Error sending tracking link:', error);
    throw error;
  }
}

/**
 * Verify tracking token is valid and not expired
 * 
 * @param email - Email address
 * @param token - Tracking token from URL
 * @returns True if valid and not expired
 */
export function verifyTrackingToken(email: string, token: string): boolean {
  try {
    const stored = emailTokens.get(email);

    // Token doesn't exist
    if (!stored) {
      logger.warn(`❌ No token found for email: ${email}`);
      return false;
    }

    // Token doesn't match
    if (stored.token !== token) {
      logger.warn(`❌ Invalid token for email: ${email}`);
      return false;
    }

    // Token expired
    if (stored.expiresAt < new Date()) {
      emailTokens.delete(email); // Clean up expired token
      logger.warn(`❌ Token expired for email: ${email}`);
      return false;
    }

    logger.info(`✅ Token verified for email: ${email}`);
    return true;
  } catch (error) {
    logger.error('❌ Error verifying token:', error);
    return false;
  }
}

/**
 * Regenerate tracking token (e.g., if user lost email)
 * 
 * @param email - Email address
 * @returns New tracking link
 */
export async function regenerateTrackingToken(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Delete old token if exists
    emailTokens.delete(email);

    // Generate and send new token
    return await sendTrackingLink(email);
  } catch (error) {
    logger.error('❌ Error regenerating tracking token:', error);
    throw error;
  }
}

/**
 * Cleanup expired tokens periodically
 * Should be called by a scheduled job every hour
 */
export function cleanupExpiredTokens(): number {
  try {
    const now = new Date();
    let cleanedCount = 0;

    emailTokens.forEach((value, key) => {
      if (value.expiresAt < now) {
        emailTokens.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      logger.info(`✅ Cleaned up ${cleanedCount} expired tracking tokens`);
    }

    return cleanedCount;
  } catch (error) {
    logger.error('❌ Error cleaning up expired tokens:', error);
    return 0;
  }
}

/**
 * Get all active tokens (for debugging - don't expose to users!)
 */
export function getActiveTokenCount(): number {
  return emailTokens.size;
}
