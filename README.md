<div align="center">

# Vigil Health — Waitlist

**An offline-first medication safety platform built for Nigeria, designed for the world.**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/) [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/) [![License](https://img.shields.io/badge/License-MIT-2DBD9B?style=flat-square)](https://claude.ai/chat/LICENSE)

[Live Site](https://vigil-waitlist.vercel.app/) · [Report a Bug](https://github.com/YOUR-USERNAME/vigil-waitlist/issues)

</div>

----------


![Vigil Health Waitlist Page](https://github.com/daniel-odulate22/Vigil-waitlist/blob/main/assets/waitlist_screenshot.png)

----------

## Table of Contents

-   [About](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#about)
-   [Features](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#features)
-   [Tech Stack](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#tech-stack)
-   [Architecture](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#architecture)
-   [Project Structure](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#project-structure)
-   [Getting Started](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#getting-started)
-   [Environment Variables](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#environment-variables)
-   [API Reference](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#api-reference)
-   [Design System](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#design-system)
-   [Deployment](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#deployment)
-   [Roadmap](https://claude.ai/chat/f93abfaa-5892-4a84-88f7-ac7906a4d8a5#roadmap)

----------

## About

Vigil Health is a **medical-grade, offline-first medication safety app** built to ensure no patient misses a dose. This repository contains the waitlist website — a production-ready fullstack application that collects early signups, stores them in MongoDB, and sends on-brand confirmation emails automatically.

**The problem Vigil solves:**

In Nigeria, missed doses are not inconveniences. Power outages averaging 18 hours a day, zero mobile data in rural areas, counterfeit drugs flooding the market, and complex multi-medication schedules create a cascade that ends in hospital readmissions and preventable deaths. 68% of hospital readmissions in Sub-Saharan Africa are linked to medication non-adherence.

Vigil exists to stop that cascade. Offline-first by design. Safety-first by default.

----------

## Features

**Waitlist Page**

-   Warm, trust-first hero section built to convert in under 15 milliseconds
-   Name, email, and role capture (Patient, Caregiver, Doctor/Nurse, Family Member)
-   Real-time form validation with accessible error states
-   Loading indicator on submit with progress feedback
-   Success state showing personalised spot number
-   Duplicate email detection with user-friendly messaging
-   Scroll reveal animations with intentional stagger timing
-   CSS phone mockups showing real app screens inline
-   Fully responsive from 320px to 1440px+
-   WCAG AA accessible — focus states, ARIA labels, reduced motion support

**Backend**

-   RESTful Express API with three endpoints
-   MongoDB Atlas storage with auto-incrementing spot numbers
-   On-brand HTML confirmation email via Gmail SMTP (Nodemailer)
-   Input validation and sanitisation on every field
-   Rate limiting — 5 submissions per IP per hour
-   Duplicate email rejection at both controller and database level
-   Rich terminal logging with timestamps and event symbols
-   Admin CSV export protected by API key header
-   Serverless-ready with MongoDB connection caching for Vercel

----------

## Tech Stack

Layer

Technology

Reason

Frontend

HTML, CSS, Vanilla JS

No framework overhead for a single page

Backend

Node.js + Express

Familiar, lightweight, production-proven

Database

MongoDB Atlas

Flexible schema, free tier, Nigerian-region hosting

Email

Nodemailer + Gmail SMTP

Zero cost, reliable delivery

Deployment

Vercel (fullstack)

Single platform, auto-deploys from GitHub

Design Fonts

Fraunces + DM Sans

Warm editorial display + clean readable body

----------

## Architecture

```
GitHub Repository
        │
        ▼
    Vercel Build
   ┌────────────────────────────────────────┐
   │                                        │
   │  frontend/         api/                │
   │  index.html   →   index.js             │
   │  app.js       →   (serverless fn)      │
   │  (static)         │                    │
   │                   ▼                    │
   │              Express App               │
   │                   │                    │
   └───────────────────┼────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        MongoDB Atlas      Gmail SMTP
        (waitlists)     (confirmation email)

```

**Key architectural decision — Vercel Fullstack:**

The frontend and backend share the same Vercel domain. The frontend calls `/api/waitlist` (a relative URL) rather than an external server. This eliminates CORS configuration entirely and means there is no second service to manage, monitor, or pay for.

**MongoDB Connection Caching:**

Vercel runs Express as serverless functions that spin up and down. Without caching, each invocation would open a fresh MongoDB connection, hitting Atlas's connection limit rapidly. The `backend/config/db.js` caches the connection on `global._mongooseConnection`, so warm function instances reuse the existing connection.

----------

## Project Structure

```
vigil-waitlist/
│
├── api/
│   └── index.js                 # Vercel serverless entry point
│                                # Wraps Express app, handles DB caching
│
├── frontend/
│   ├── index.html               # Waitlist page (all CSS inline)
│   └── app.js                   # Form logic, API calls, scroll reveal
│
├── backend/
│   ├── server.js                # Local dev server entry point
│   ├── app.js                   # Express app config, CORS, middleware
│   ├── jsconfig.json            # VS Code CommonJS module config
│   │
│   ├── config/
│   │   └── db.js                # MongoDB connection with serverless caching
│   │
│   ├── controllers/
│   │   └── waitlistController.js  # joinWaitlist, getCount, exportCSV
│   │
│   ├── middleware/
│   │   ├── rateLimiter.js       # 5 requests/IP/hour on POST
│   │   └── validateInput.js     # express-validator rules + error handler
│   │
│   ├── models/
│   │   └── Waitlist.js          # Mongoose schema, auto spot numbering
│   │
│   ├── routes/
│   │   └── waitlistRoutes.js    # Route definitions
│   │
│   └── services/
│       └── emailService.js      # Nodemailer transporter + HTML template
│
├── assets/
│   ├── banner.svg               # README banner
│   └── preview.png              # Page screenshot (add your own)
│
├── package.json                 # Root dependencies for Vercel
├── vercel.json                  # Vercel routing — static + serverless
├── .gitignore
└── README.md

```

----------

## Getting Started

### Prerequisites

-   Node.js 18.x or higher
-   A MongoDB Atlas account (free tier)
-   A Gmail account with 2-Step Verification enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/vigil-waitlist.git
cd vigil-waitlist

# Install dependencies
npm install

```

### Local Development

```bash
# Copy environment variables template
cp backend/.env.example backend/.env

# Fill in your values (see Environment Variables section below)
# Then start the backend
node backend/server.js

```

Open `frontend/index.html` with VS Code Live Server (recommended) or:

```bash
cd frontend
python3 -m http.server 5500
# Open http://localhost:5500

```

The frontend auto-detects `localhost` and points `API_BASE` to `http://localhost:5001`. On Vercel in production, `API_BASE` becomes an empty string (same domain, no CORS).

----------

## Environment Variables

Create `backend/.env` from the template:

```bash
cp backend/.env.example backend/.env

```

Variable

Description

Example

`MONGO_URI`

MongoDB Atlas connection string

`mongodb+srv://user:pass@cluster.mongodb.net/vigil`

`EMAIL_USER`

Gmail address for sending emails

`hello@vigilhealth.com`

`EMAIL_PASS`

Gmail App Password (16 chars, not your real password)

`abcd efgh ijkl mnop`

`EMAIL_FROM`

Display name in confirmation emails

`Vigil Health <hello@vigilhealth.com>`

`ADMIN_API_KEY`

Secret key for CSV export endpoint

`a-long-random-string`

`NODE_ENV`

Environment mode

`production` or `development`

`PORT`

Local server port (local only, Vercel ignores this)

`5001`

**Getting a Gmail App Password:**

1.  Go to myaccount.google.com → Security
2.  Enable 2-Step Verification
3.  Security → App Passwords → Create → name it "Vigil Health"
4.  Copy the 16-character password into `EMAIL_PASS`

**Never commit `.env` to version control.** It is listed in `.gitignore`. Use `backend/.env.example` as a safe template to commit instead.

----------

## API Reference

### POST `/api/waitlist`

Register a new waitlist entry.

**Request body:**

```json
{
  "name": "Adaeze Okafor",
  "email": "adaeze@example.com",
  "role": "caregiver"
}

```

**Role values:** `patient` · `caregiver` · `doctor_nurse` · `family_member` · `not_specified`

**Responses:**

Status

Meaning

Body

`201`

Created successfully

`{ success: true, spotNumber: 42 }`

`409`

Email already registered

`{ success: false, message: "..." }`

`422`

Validation failed

`{ success: false, errors: [...] }`

`429`

Rate limit hit

`{ success: false, message: "..." }`

`500`

Server error

`{ success: false, message: "..." }`

**Rate limit:** 5 requests per IP per hour.

----------

### GET `/api/waitlist/count`

Returns total number of waitlist signups. Public endpoint.

```json
{ "count": 247 }

```

----------

### GET `/api/waitlist/export`

Downloads all entries as a CSV file. Admin only.

**Required header:** `x-admin-key: YOUR_ADMIN_API_KEY`

**Response:** CSV file download with columns: `Spot #, Name, Email, Role, Email Sent, Signed Up At`

**Example (curl):**

```bash
curl -H "x-admin-key: your_secret" \
  https://vigil-waitlist.vercel.app/api/waitlist/export \
  -o waitlist.csv

```

----------

## Design System

The page is built on a strict design system. Every value references a named CSS variable. Nothing is hardcoded.

**Color Tokens:**

Token

Value

Usage

`--color-navy`

`#0B1437`

Primary brand, headings, dark sections

`--color-teal`

`#2DBD9B`

Success states, CTAs, accents

`--color-teal-pale`

`#E6F9F5`

Chip backgrounds, success panels

`--color-bg`

`#F7F8FA`

Page background

`--color-surface`

`#FFFFFF`

Cards, form, inputs

**Typography:**

Font

Role

Source

Fraunces

Display, headlines, emotional copy

Google Fonts

DM Sans

Body, UI, labels, inputs

Google Fonts

**Border Radius — exactly 3 values:**

Token

Value

Usage

`--radius-sm`

`8px`

Inputs, small badges

`--radius-md`

`14px`

Cards, panels

`--radius-lg`

`24px`

Pill buttons, chips

**Easing Curves:**

Token

Value

Usage

`--ease-out-expo`

`cubic-bezier(0.22, 1, 0.36, 1)`

Entrance animations

`--ease-in-out`

`cubic-bezier(0.45, 0, 0.55, 1)`

State transitions

`--ease-spring`

`cubic-bezier(0.34, 1.56, 0.64, 1)`

Chip selection

----------

## Deployment

This project deploys as a fullstack Vercel application. One repository. One platform. Zero additional services.

```
GitHub push → Vercel builds → frontend served as static
                           → backend served as serverless function

```

**Set these environment variables in Vercel dashboard:**

```
MONGO_URI, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, ADMIN_API_KEY, NODE_ENV=production

```

See [DEPLOYMENT-GUIDE.md](https://claude.ai/chat/DEPLOYMENT-GUIDE.md) for the full step-by-step walkthrough.

----------

## Roadmap

-   [x] Waitlist page with name, email, role capture
-   [x] MongoDB storage with auto spot numbering
-   [x] On-brand HTML confirmation email
-   [x] Admin CSV export
-   [x] Vercel fullstack deployment
-   [ ] Referral mechanics (share your link, move up the list)
-   [ ] Admin dashboard to view signups without CSV export
-   [ ] Email verification (confirm email before spot is secured)
-   [ ] Waitlist milestone announcements (100 signups, 500 signups)

----------

## License

MIT © 2026 Vigil Health

----------

<div align="center">

**Built for Nigeria. Designed for the world.**

[vigilhealth-waitlist.vercel.app](https://vigilhealth-waitlist.vercel.app/)

</div>
