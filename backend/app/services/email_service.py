"""
Email service stub — replace with real SMTP / SendGrid / AWS SES in production.
"""

import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str) -> None:
    """
    Stub implementation. In production, integrate with an email provider.
    """
    logger.info("[EMAIL] to=%s subject=%s body=%s", to, subject, body)