const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // this already creates an index — no schema.index needed
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      maxlength: 255,
    },
    role: {
      type: String,
      enum: ['patient', 'caregiver', 'doctor_nurse', 'family_member', 'not_specified'],
      default: 'not_specified',
    },
    spotNumber: {
      type: Number,
      unique: true,
    },
    // Store IP for abuse detection — never returned in API responses
    ipAddress: {
      type: String,
      select: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Auto-assign spotNumber before saving a new entry
waitlistSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Waitlist').countDocuments();
    this.spotNumber = count + 1;
  }
  next();
});

// Index for fast lookup by date (email index already created by unique:true above)
waitlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);