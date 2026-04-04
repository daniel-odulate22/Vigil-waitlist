const Waitlist = require('../models/waitlist');
const { sendConfirmationEmail } = require('../services/emailService');

// ── Terminal logger ──────────────────────────────────────────
// Prints timestamped, labelled messages for every meaningful event
const log = {
  info: (msg) => console.log(`\n[${new Date().toLocaleTimeString()}] ℹ  ${msg}`),
  success: (msg) => console.log(`[${new Date().toLocaleTimeString()}] ✓  ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toLocaleTimeString()}] ⚠  ${msg}`),
  error: (msg) => console.error(`[${new Date().toLocaleTimeString()}] ✗  ${msg}`),
  divider: () => console.log('─'.repeat(52)),
};

// ── POST /api/waitlist ───────────────────────────────────────
const joinWaitlist = async (req, res) => {
  const { name, email, role = 'not_specified' } = req.body;

  log.divider();
  log.info(`New signup attempt — ${email}`);

  try {
    // Check for duplicate
    const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      log.warn(`Duplicate email rejected — ${email} (already Spot #${existing.spotNumber})`);
      log.divider();
      return res.status(409).json({
        success: false,
        message: 'This email is already on the waitlist.',
      });
    }

    // Save to MongoDB
    const entry = await Waitlist.create({ name, email, role, ipAddress: req.ip });

    log.success(`Saved to MongoDB`);
    log.success(`Name:     ${entry.name}`);
    log.success(`Email:    ${entry.email}`);
    log.success(`Role:     ${entry.role}`);
    log.success(`Spot:     #${entry.spotNumber}`);
    log.success(`Time:     ${new Date(entry.createdAt).toLocaleString()}`);

    // Send confirmation email
    try {
      log.info(`Sending confirmation email to ${entry.email}...`);
      await sendConfirmationEmail({
        name: entry.name,
        email: entry.email,
        spotNumber: entry.spotNumber,
        role: entry.role,
      });
      await Waitlist.findByIdAndUpdate(entry._id, { emailSent: true });
      log.success(`Confirmation email sent to ${entry.email}`);
    } catch (emailErr) {
      log.warn(`Email failed for ${entry.email} — ${emailErr.message}`);
      log.warn(`User is saved in MongoDB. Email can be resent manually.`);
    }

    // Print running total
    const total = await Waitlist.countDocuments();
    log.info(`Total waitlist size: ${total} ${total === 1 ? 'person' : 'people'}`);
    log.divider();

    return res.status(201).json({
      success: true,
      message: 'You are on the list.',
      spotNumber: entry.spotNumber,
    });

  } catch (err) {
    if (err.code === 11000) {
      log.warn(`Race condition — duplicate email caught at DB level: ${email}`);
      log.divider();
      return res.status(409).json({
        success: false,
        message: 'This email is already on the waitlist.',
      });
    }
    log.error(`joinWaitlist crashed — ${err.message}`);
    log.divider();
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

// ── GET /api/waitlist/count ──────────────────────────────────
const getCount = async (req, res) => {
  try {
    const count = await Waitlist.countDocuments();
    log.info(`Count requested — ${count} on waitlist`);
    return res.status(200).json({ count });
  } catch (err) {
    log.error(`getCount failed — ${err.message}`);
    return res.status(500).json({ message: 'Could not fetch count.' });
  }
};

// ── GET /api/waitlist/export ─────────────────────────────────
const exportCSV = async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    log.warn(`Unauthorised export attempt from ${req.ip}`);
    return res.status(401).json({ message: 'Unauthorised.' });
  }

  try {
    const entries = await Waitlist.find({})
      .select('spotNumber name email role emailSent createdAt')
      .sort({ spotNumber: 1 })
      .lean();

    const header = 'Spot #,Name,Email,Role,Email Sent,Signed Up At\n';
    const rows = entries.map((e) => {
      const role = e.role.replace('_', ' ');
      const date = new Date(e.createdAt).toISOString();
      return `${e.spotNumber},"${e.name}","${e.email}","${role}",${e.emailSent},${date}`;
    });

    const csv = header + rows.join('\n');
    const filename = `vigil-waitlist-${new Date().toISOString().split('T')[0]}.csv`;

    log.success(`CSV export — ${entries.length} records downloaded`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    log.error(`exportCSV failed — ${err.message}`);
    return res.status(500).json({ message: 'Export failed.' });
  }
};

module.exports = { joinWaitlist, getCount, exportCSV };