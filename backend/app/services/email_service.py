"""
Email service stub — replace with real SMTP / SendGrid / AWS SES in production.
"""

import logging
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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


async def send_email(to: str, subject: str, body: str) -> None:
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_FROM
            msg["To"] = to
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(_html_template(subject, body), "html"))
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_FROM, to, msg.as_string())
            logger.info("[EMAIL SENT] to=%s subject=%s", to, subject)
        except Exception as e:
            logger.error("[EMAIL FAILED] to=%s error=%s", to, e)
    else:
        logger.info("[EMAIL STUB] to=%s subject=%s body=%s", to, subject, body)
