"""
Email service — sends real emails via SMTP or logs when not configured.
Configure via environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
"""

import logging
import smtplib
import os
import socket
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Patch getaddrinfo to force IPv4 on Render (fixes Errno 101 Network is unreachable)
_old_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(*args, **kwargs):
    responses = _old_getaddrinfo(*args, **kwargs)
    ipv4_responses = [r for r in responses if r[0] == socket.AF_INET]
    return ipv4_responses or responses
socket.getaddrinfo = _ipv4_getaddrinfo

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "no-reply@nexacargo.com")


def _html_template(subject: str, body: str) -> str:
    return f"""
    <html><body style="font-family:Arial,sans-serif;background:#0B1F3A;color:#fff;padding:32px;">
      <div style="max-width:600px;margin:auto;background:#0d2545;border-radius:12px;padding:32px;border:1px solid rgba(0,194,255,0.2);">
        <h2 style="color:#00C2FF;margin-top:0;">NexaCargo</h2>
        <h3 style="color:#fff;">{subject}</h3>
        <p style="color:#a0b4cc;line-height:1.6;">{body}</p>
        <hr style="border-color:rgba(255,255,255,0.1);margin:24px 0;">
        <p style="color:#5a7a9a;font-size:12px;">This is an automated message from NexaCargo. Please do not reply.</p>
      </div>
    </body></html>
    """


def is_email_configured() -> bool:
    """Check if email service is properly configured."""
    placeholder_user = SMTP_USER in ("", "your@gmail.com")
    placeholder_pass = SMTP_PASS in ("", "your_app_password")
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASS and not placeholder_user and not placeholder_pass)


async def send_email(to: str, subject: str, body: str) -> bool:
    """
    Send an email to the specified recipient.

    Args:
        to: Recipient email address
        subject: Email subject line
        body: Email body text

    Returns:
        True if email was sent successfully, False otherwise
    """
    if not is_email_configured():
        logger.warning("[EMAIL STUB - NOT CONFIGURED] to=%s subject=%s", to, subject)
        logger.info("To enable email, set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(_html_template(subject, body), "html"))

        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
            server.starttls()

        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, to, msg.as_string())
        server.quit()

        logger.info("[EMAIL SENT] to=%s subject=%s", to, subject)
        return True

    except Exception as e:
        logger.error("[EMAIL FAILED] to=%s error=%s", to, e)
        return False
