"""
Email Notification Service for AdaptiveLearn AI
Supports SMTP sending (production) and Mock/Console Outbox (testing & development).
Includes 10 responsive, accessible HTML email templates.
"""

import os
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

# In-memory outbox for testing and inspection
OUTBOX: List[Dict[str, Any]] = []

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "support@adaptlearn.ai")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

BASE_CSS = """
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; color: #1E293B; }
.container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #F1E5DF; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.header { text-align: center; border-bottom: 1px solid #F1E5DF; padding-bottom: 20px; margin-bottom: 24px; }
.logo-title { font-size: 24px; font-weight: 800; color: #1E293B; letter-spacing: -0.02em; }
.logo-highlight { color: #E83B64; }
.badge { display: inline-block; background: #FFF1F2; color: #E83B64; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; margin-top: 8px; }
.btn { display: inline-block; background: #E83B64; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; text-align: center; margin: 20px 0; }
.otp-box { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #E83B64; background: #FFF1F2; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px dashed #E83B64; }
.footer { text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #F1E5DF; padding-top: 20px; margin-top: 32px; }
"""

def get_smtp_config():
    raw_pass = os.getenv("SMTP_PASSWORD", "")
    # Remove spaces if Google App Password format (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
    clean_pass = raw_pass.replace(" ", "").strip() if raw_pass else ""
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USERNAME", "").strip(),
        "pass": clean_pass,
        "from": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USERNAME", "support@adaptlearn.ai")).strip(),
    }

def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Sends email via SMTP if configured; otherwise logs to OUTBOX and console for local verification.
    """
    cfg = get_smtp_config()
    email_record = {
        "to": to_email,
        "from": cfg["from"],
        "subject": subject,
        "html": html_content,
        "text": text_content or subject,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    OUTBOX.append(email_record)

    # Attempt real SMTP if configured
    if cfg["host"] and cfg["user"] and cfg["pass"]:
        try:
            from_addr = cfg["from"] if cfg["from"] and "@" in cfg["from"] else cfg["user"]
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"AdaptiveLearn AI <{from_addr}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if cfg["port"] == 465:
                with smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=10) as server:
                    server.login(cfg["user"], cfg["pass"])
                    server.send_message(msg)
            else:
                with smtplib.SMTP(cfg["host"], cfg["port"], timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(cfg["user"], cfg["pass"])
                    server.send_message(msg)

            print(f"[EMAIL SERVICE] [SUCCESS] Real SMTP email delivered to {to_email}: {subject}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE] [FAILED] SMTP delivery error ({e}); recorded in local OUTBOX.")
            return False
    else:
        print(f"[EMAIL SERVICE] [LOCAL OUTBOX] To: {to_email} | Subject: {subject}")
        return True

# -----------------------------------------------------------------------------
# 1. Welcome Email
# -----------------------------------------------------------------------------
def send_welcome_email(to_email: str, user_name: str, role: str = "student") -> bool:
    subject = "Welcome to AdaptiveLearn AI!"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Inclusive Education for Everyone</div>
        </div>
        <h2>Welcome aboard, {user_name}! 🎓</h2>
        <p>Thank you for joining <strong>AdaptiveLearn AI</strong>. Our mission is to provide personalized, accessible education tailored to your unique pace, format preferences, and strengths.</p>
        <p>Your account has been configured with role: <strong>{role.capitalize()}</strong>.</p>
        <div style="text-align: center;">
          <a href="{FRONTEND_URL}/dashboard" class="btn">Launch Your Learning Workspace</a>
        </div>
        <p>If you have any accessibility requirements, you can customize your workspace anytime in the Accessibility Control panel.</p>
        <div class="footer">AdaptiveLearn AI &bull; Empowering Inclusive Learning &bull; Hackathon Challenge HI-03</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 2. Email Verification
# -----------------------------------------------------------------------------
def send_verification_email(to_email: str, user_name: str, verification_url: str) -> bool:
    subject = "Verify Your AdaptiveLearn AI Account"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Email Verification</div>
        </div>
        <h2>Verify Your Email Address</h2>
        <p>Welcome to AdaptiveLearn AI, {user_name}!</p>
        <p>Thank you for joining our inclusive learning platform. Please verify your email address to activate all platform features and save your progress across devices.</p>
        <div style="text-align: center;">
          <a href="{verification_url}" class="btn">Verify Email Address</a>
        </div>
        <p style="font-size: 13px; color: #64748B;">This verification link will expire in 24 hours. If you did not create an AdaptiveLearn AI account, please disregard this email.</p>
        <p style="font-size: 12px; word-break: break-all; color: #94A3B8;">Link: {verification_url}</p>
        <div class="footer">AdaptiveLearn AI Security &bull; Verification Policy</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 3. OTP Verification
# -----------------------------------------------------------------------------
def send_otp_email(to_email: str, user_name: str, otp_code: str, purpose: str = "login") -> bool:
    subject = f"Your AdaptiveLearn AI Verification Code: {otp_code}"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Two-Factor Authentication</div>
        </div>
        <h2>One-Time Passcode (OTP)</h2>
        <p>Hello {user_name},</p>
        <p>Use the following 6-digit verification code to complete your {purpose}:</p>
        <div class="otp-box">{otp_code}</div>
        <p style="font-size: 13px; color: #64748B; text-align: center;">
          This code is valid for <strong>5 minutes</strong> and can only be used once. Never share this code with anyone.
        </p>
        <div class="footer">AdaptiveLearn AI &bull; Automated Security Notice</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 4. Password Reset
# -----------------------------------------------------------------------------
def send_password_reset_email(to_email: str, user_name: str, reset_url: str) -> bool:
    subject = "Reset Your AdaptiveLearn AI Password"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Password Recovery</div>
        </div>
        <h2>Reset Your Password</h2>
        <p>Hello {user_name},</p>
        <p>We received a request to reset your password for your AdaptiveLearn AI account. Click the button below to choose a new, secure password:</p>
        <div style="text-align: center;">
          <a href="{reset_url}" class="btn">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748B;">This password reset link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 12px; word-break: break-all; color: #94A3B8;">Link: {reset_url}</p>
        <div class="footer">AdaptiveLearn AI &bull; Account Protection</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 5. Password Changed Confirmation
# -----------------------------------------------------------------------------
def send_password_changed_email(to_email: str, user_name: str) -> bool:
    subject = "Your AdaptiveLearn AI Password Has Been Changed"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Security Alert</div>
        </div>
        <h2>Password Successfully Updated</h2>
        <p>Hello {user_name},</p>
        <p>This email confirms that the password for your AdaptiveLearn AI account was recently changed.</p>
        <p>If you made this change, no further action is needed.</p>
        <p style="color: #E11D48; font-weight: 600;">If you did not make this change, please immediately reset your password or contact our support team.</p>
        <div class="footer">AdaptiveLearn AI &bull; Security & Account Protection</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 6. New Device Login Alert
# -----------------------------------------------------------------------------
def send_new_device_login_email(to_email: str, user_name: str, device_info: str, ip_address: str) -> bool:
    subject = "New Login to Your AdaptiveLearn AI Account"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Device Authorization</div>
        </div>
        <h2>New Device Sign-In Detected</h2>
        <p>Hello {user_name},</p>
        <p>Your AdaptiveLearn AI account was just accessed from a new device or browser:</p>
        <ul>
          <li><strong>Device:</strong> {device_info}</li>
          <li><strong>IP Address:</strong> {ip_address}</li>
          <li><strong>Time:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
        </ul>
        <p>If this was you, you can ignore this alert. If this was not you, please log out from all devices in your Security Settings immediately.</p>
        <div class="footer">AdaptiveLearn AI &bull; Device Management</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 7. Suspicious Login Alert
# -----------------------------------------------------------------------------
def send_suspicious_login_email(to_email: str, user_name: str, reason: str, ip_address: str) -> bool:
    subject = "Security Alert: Suspicious Activity Detected on Your Account"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge" style="background:#FEE2E2; color:#DC2626;">Suspicious Activity</div>
        </div>
        <h2 style="color:#DC2626;">Suspicious Login Attempt Blocked</h2>
        <p>Hello {user_name},</p>
        <p>We detected an unusual or repeated failed login attempt targeting your account:</p>
        <p><strong>Reason:</strong> {reason}<br><strong>IP Address:</strong> {ip_address}</p>
        <p>As a precaution, your account has been temporarily locked to protect your data. If you need assistance, please follow our password recovery process.</p>
        <div class="footer">AdaptiveLearn AI &bull; Threat Prevention Engine</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 8. Account Security Changes
# -----------------------------------------------------------------------------
def send_security_change_email(to_email: str, user_name: str, change_summary: str) -> bool:
    subject = "Security Settings Updated on Your AdaptiveLearn AI Account"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Security Setting Change</div>
        </div>
        <h2>Account Settings Updated</h2>
        <p>Hello {user_name},</p>
        <p>The following security modification was made to your account:</p>
        <div style="background:#F8FAFC; padding:16px; border-radius:8px; border:1px solid #E2E8F0; margin:16px 0;">
          <strong>{change_summary}</strong>
        </div>
        <p>If you did not authorize this change, please check your active sessions immediately.</p>
        <div class="footer">AdaptiveLearn AI &bull; Identity Governance</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 9. Teacher Announcements
# -----------------------------------------------------------------------------
def send_teacher_announcement_email(to_email: str, user_name: str, teacher_name: str, announcement_text: str) -> bool:
    subject = f"Class Announcement from {teacher_name}"
    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Teacher Announcement</div>
        </div>
        <h2>Message from {teacher_name}</h2>
        <p>Hello {user_name},</p>
        <div style="background:#F0FDF4; padding:16px; border-radius:12px; border:1px solid #BBF7D0; margin:16px 0;">
          {announcement_text}
        </div>
        <div style="text-align: center;">
          <a href="{FRONTEND_URL}/dashboard" class="btn">View Classroom Updates</a>
        </div>
        <div class="footer">AdaptiveLearn AI &bull; Inclusive Faculty Portal</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

# -----------------------------------------------------------------------------
# 10. Learning Progress Summary
# -----------------------------------------------------------------------------
def send_learning_progress_summary_email(to_email: str, user_name: str, summary_data: Dict[str, Any]) -> bool:
    subject = f"Your Weekly Learning Progress Summary: {user_name}"
    mastery = summary_data.get("mastery", 78)
    streak = summary_data.get("streak", 5)
    study_mins = summary_data.get("studyMinutes", 85)

    html = f"""
    <!DOCTYPE html>
    <html><head><style>{BASE_CSS}</style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-title">AdaptiveLearn <span class="logo-highlight">AI</span></div>
          <div class="badge">Weekly Learning Summary</div>
        </div>
        <h2>Weekly Learning Highlights! 🌟</h2>
        <p>Great job this week, {user_name}! Here is a snapshot of your progress:</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:10px 0; color:#64748B;">Overall STEM Mastery:</td>
            <td style="padding:10px 0; font-weight:700; text-align:right;">{mastery}%</td>
          </tr>
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:10px 0; color:#64748B;">Active Study Streak:</td>
            <td style="padding:10px 0; font-weight:700; color:#F59E0B; text-align:right;">{streak} Days</td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:#64748B;">Total Study Time:</td>
            <td style="padding:10px 0; font-weight:700; text-align:right;">{study_mins} Minutes</td>
          </tr>
        </table>
        <div style="text-align: center;">
          <a href="{FRONTEND_URL}/twin" class="btn">Check Your AI Learning Twin</a>
        </div>
        <div class="footer">AdaptiveLearn AI &bull; Personalized Learning for Everyone</div>
      </div>
    </body></html>
    """
    return send_email(to_email, subject, html)

