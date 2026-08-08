# Email Configuration Guide

## Problem
When clicking "Send Notification" in the admin portal, emails are not being delivered to users.

## Root Cause
The email service requires SMTP credentials to send real emails. Without proper configuration, emails are only logged (stub mode).

## Solution

### Option 1: Gmail SMTP (Recommended for development)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update your `.env` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # Your 16-char app password
SMTP_FROM=your-email@gmail.com
```

4. **Restart the backend server**

### Option 2: SendGrid (Recommended for production)

1. Create a SendGrid account at https://sendgrid.com
2. Verify your sender identity
3. Generate an API key
4. Update `.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
SMTP_FROM=noreply@yourdomain.com
```

### Option 3: AWS SES (Enterprise)

1. Verify your domain in AWS SES
2. Create SMTP credentials
3. Update `.env`:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

## Verification

After configuration, test by:
1. Go to Admin Portal → Notifications
2. Click "Send Notification"
3. Fill in recipient email and message
4. Click "Send"
5. Check recipient inbox

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check firewall allows outbound port 587 |
| "Authentication failed" | Verify app password (not regular password) |
| "Network unreachable" | Check internet connection |
| Emails in spam | Add SPF/DKIM records for your domain |
| Gmail blocks login | Enable "Less secure apps" or use App Password |

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 (TLS) or 465 (SSL) |
| `SMTP_USER` | SMTP username/email | your@gmail.com |
| `SMTP_PASS` | SMTP password/app password | xxxx-xxxx-xxxx-xxxx |
| `SMTP_FROM` | Sender email address | noreply@nexacargo.com |
