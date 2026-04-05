const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────
// Using explicit SMTP config instead of service:'gmail' shorthand.
// This avoids connection timeouts on some Windows/network setups.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,        // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs on some networks
  },
});

// ── Role display map ─────────────────────────────────────────
const roleLabels = {
  patient:       'Patient',
  caregiver:     'Caregiver',
  doctor_nurse:  'Doctor / Nurse',
  family_member: 'Family Member',
  not_specified: 'Early Supporter',
};

// ── HTML Email Template ──────────────────────────────────────
// On-brand: navy + teal, Fraunces-inspired structure, clean layout
function buildEmailHTML(name, spotNumber, role) {
  const roleLabel = roleLabels[role] || 'Early Supporter';
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You are on the Vigil Health waitlist</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F8FA;font-family:'DM Sans',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader text (hidden, shows in email preview) -->
  <span style="display:none;font-size:1px;color:#F7F8FA;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    You have secured your spot on the Vigil Health waitlist. Spot #${spotNumber}.
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F8FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0B1437;border-radius:14px 14px 0 0;padding:32px 40px;text-align:center;">
              <!-- Logo -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="background-color:#2DBD9B;border-radius:50% 50% 50% 50% / 58% 58% 42% 42%;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:18px;font-weight:bold;line-height:36px;">&#43;</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.06em;">VIGIL HEALTH</p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:0.04em;">Your medication. Protected.</p>
            </td>
          </tr>

          <!-- Green confirmation band -->
          <tr>
            <td style="background-color:#2DBD9B;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#FFFFFF;letter-spacing:0.06em;text-transform:uppercase;">Spot #${spotNumber} Secured</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px 40px 32px;border-left:1px solid #E4E7EC;border-right:1px solid #E4E7EC;">
              <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#0B1437;line-height:1.2;">
                Hello ${firstName}! 🤗
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.7;">
                You are now on the Vigil Health waitlist. You are among the first to know when we launch.
              </p>

              <!-- Spot badge -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#E6F9F5;border:1px solid rgba(45,189,155,0.3);border-radius:24px;padding:10px 24px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#1E9E82;">
                      Your waitlist position: <strong style="color:#0B1437;">#${spotNumber}</strong> &nbsp;&middot;&nbsp; Joining as: <strong style="color:#0B1437;">${roleLabel}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What Vigil does -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0B1437;">What to expect from Vigil:</p>

              <!-- Feature rows -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #E4E7EC;vertical-align:top;width:36px;">
                    <div style="width:32px;height:32px;background-color:#E6F9F5;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">&#128276;</div>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid #E4E7EC;vertical-align:top;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0B1437;">Offline-first reminders</p>
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">Dose alerts that fire even without mobile data or stable power.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #E4E7EC;vertical-align:top;width:36px;">
                    <div style="width:32px;height:32px;background-color:#E6F9F5;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">&#128272;</div>
                  </td>
                  <td style="padding:12px 0 12px 14px;border-bottom:1px solid #E4E7EC;vertical-align:top;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0B1437;">NAFDAC drug verification</p>
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">Scan packaging to verify authenticity on-device. No counterfeit drugs in your schedule.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;vertical-align:top;width:36px;">
                    <div style="width:32px;height:32px;background-color:#E6F9F5;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">&#128101;</div>
                  </td>
                  <td style="padding:12px 0 12px 14px;vertical-align:top;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0B1437;">Caregiver network</p>
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">Family and care teams stay informed automatically. No more daily check-in calls.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#6B7280;line-height:1.7;">
                We are currently in the final stages of preparation for our pilot launch across Nigeria. As a waitlist member, you will hear from us before anyone else.
              </p>
              <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.7;">
                Built for Nigeria. Designed for the world.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#0B1437;padding:28px 40px;text-align:center;border-left:1px solid #0B1437;border-right:1px solid #0B1437;">
              <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.5);">Questions? Reach out to Alex, our customer support agent at</p>
              <a href="mailto:xand3r2297@gmail.com" style="font-size:14px;font-weight:600;color:#2DBD9B;text-decoration:none;">xand3r2297@gmail.com</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#070E2B;border-radius:0 0 14px 14px;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);">
                &copy; 2025 Vigil Health. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.18);">
                You are receiving this because you signed up at vigilhealth-waitlist.vercel.app.<br/>
                NDPA Compliant &nbsp;&middot;&nbsp; SaMD Class B
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Plain text fallback ──────────────────────────────────────
function buildEmailText(name, spotNumber, role) {
  const roleLabel = roleLabels[role] || 'Early Supporter';
  const firstName = name.split(' ')[0];
  return `
Hi ${firstName},

You are on the Vigil Health waitlist.

Waitlist position: #${spotNumber}
Joining as: ${roleLabel}

Vigil Health is an offline-first medication safety app built for Nigeria. We make sure every dose is taken, every caregiver is informed, and every medicine is real.

We are preparing for our pilot launch. You will hear from us before anyone else.

Built for Nigeria. Designed for the world.

Questions? Email us at hello@vigilhealth.com

-- Vigil Health Team
  `.trim();
}

// ── Send confirmation email ──────────────────────────────────
const sendConfirmationEmail = async ({ name, email, spotNumber, role }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `You are on the list, ${name.split(' ')[0]}. Spot #${spotNumber} secured.`,
    text: buildEmailText(name, spotNumber, role),
    html: buildEmailHTML(name, spotNumber, role),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Confirmation email sent to ${email} — Message ID: ${info.messageId}`);
  return info;
};

// ── Verify transporter on startup (optional health check) ────
const verifyEmailTransport = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter ready (Gmail SMTP connected)');
  } catch (err) {
    console.warn('Email transporter warning:', err.message);
    console.warn('Check EMAIL_USER and EMAIL_PASS in your .env file');
  }
};

module.exports = { sendConfirmationEmail, verifyEmailTransport };