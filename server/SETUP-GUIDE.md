# Vigil Health — Setup Guide
**From zero to running in under 20 minutes**

---

## What You Are Setting Up

```
vigil-waitlist/
├── vigil-waitlist.html      ← Your frontend (open in browser)
└── vigil-backend/
    ├── server.js            ← Entry point
    ├── app.js               ← Express config
    ├── package.json
    ├── .env                 ← You create this (never commit it)
    ├── config/db.js         ← MongoDB connection
    ├── models/Waitlist.js   ← Database schema
    ├── controllers/         ← Business logic
    ├── routes/              ← API endpoints
    ├── services/            ← Email (Nodemailer)
    └── middleware/          ← Validation + rate limiting
```

**API Endpoints:**
- `POST /api/waitlist` — submit a signup
- `GET  /api/waitlist/count` — get total signups (public)
- `GET  /api/waitlist/export` — download CSV (admin only)

---

## Step 1 — Install Node.js

Check if you already have it:
```bash
node --version   # Should be 18.x or higher
npm --version
```

If not installed, download from: https://nodejs.org (choose the LTS version)

---

## Step 2 — Set Up MongoDB Atlas (free)

Atlas is MongoDB's cloud database. The free tier is more than enough for a waitlist.

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a Database"** → choose **"M0 Free"** tier
3. Select a region close to Nigeria (e.g. AWS eu-west-1 / Europe Ireland is closest)
4. Create a username and password — **save these somewhere safe**
5. Under **"Where would you like to connect from?"** → choose **"My Local Environment"**
   - Add IP address: click **"Add My Current IP Address"**
   - Also add `0.0.0.0/0` (allows all IPs — needed when you deploy to a server)
6. Click **"Finish and Close"** then **"Go to Databases"**
7. Click **"Connect"** on your cluster → **"Drivers"** → select Node.js
8. Copy the connection string. It looks like this:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Change `?retryWrites` to `/vigil-waitlist?retryWrites` to set the database name:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/vigil-waitlist?retryWrites=true&w=majority
   ```

---

## Step 3 — Get a Gmail App Password

You need an **App Password**, NOT your real Gmail password.
App Passwords are 16-character codes Gmail generates for specific apps.

1. Go to https://myaccount.google.com
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
   - If it is off, turn it on first (required for App Passwords)
4. Scroll to the bottom → click **App passwords**
5. Under "App name" type: `Vigil Health`
6. Click **Create**
7. Google shows you a 16-character password like: `abcd efgh ijkl mnop`
8. Copy it (spaces are fine, or remove them)

---

## Step 4 — Install Dependencies

Open your terminal. Navigate to your backend folder:

```bash
cd vigil-backend
npm install
```

This installs: express, mongoose, nodemailer, helmet, cors, express-rate-limit, express-validator, dotenv, nodemon.

---

## Step 5 — Create Your .env File

In the `vigil-backend` folder, create a new file called `.env` (no extension):

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows:
copy .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://127.0.0.1:5500

MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vigil-waitlist?retryWrites=true&w=majority

EMAIL_USER=your.actual.gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

EMAIL_FROM=Vigil Health <your.actual.gmail@gmail.com>

ADMIN_API_KEY=make-this-a-long-random-string-nobody-can-guess
```

**Important rules for .env:**
- No quotes around values
- No spaces around the `=` sign
- Replace every placeholder with real values

---

## Step 6 — Start the Backend

```bash
cd vigil-backend
npm run dev
```

You should see:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Email transporter ready (Gmail SMTP connected)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vigil Health API running
  Port:    5001
  Mode:    development
  Health:  http://localhost:5001/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If you see an error, check the troubleshooting section below.

---

## Step 7 — Open the Frontend

The HTML file needs to be served over HTTP (not opened as a file://) so the API calls work correctly.

**Option A — VS Code Live Server (recommended):**
1. Install the "Live Server" extension in VS Code
2. Right-click `vigil-waitlist.html` → **"Open with Live Server"**
3. It opens at `http://127.0.0.1:5500/vigil-waitlist.html`

**Option B — Python (if you have Python installed):**
```bash
# In the folder containing vigil-waitlist.html:
python3 -m http.server 5500
# Then open: http://localhost:5500/vigil-waitlist.html
```

---

## Step 8 — Test a Submission

1. Open the page in your browser
2. Fill in the form with your name and email
3. Click "Reserve my spot"
4. You should:
   - See the green success panel with your spot number
   - Receive a confirmation email in your inbox within 30 seconds
   - See a new entry in MongoDB Atlas (go to Atlas → Browse Collections)

---

## Step 9 — View Your Signups in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Click your cluster → **"Browse Collections"**
3. Select the `vigil-waitlist` database → `waitlists` collection
4. Every signup appears here with name, email, role, spot number, and timestamp

---

## Step 10 — Export Your Waitlist as CSV

To download all signups as a spreadsheet:

```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  http://localhost:5001/api/waitlist/export \
  -o vigil-waitlist.csv
```

Replace `YOUR_ADMIN_API_KEY` with the value you set in `.env`.

Or open in browser with a REST client like Insomnia or Postman:
- Method: GET
- URL: `http://localhost:5001/api/waitlist/export`
- Header: `x-admin-key: your_key_here`

---

## Troubleshooting

### "MongoDB connection failed"
- Double-check your MONGO_URI in .env
- Make sure your IP address is whitelisted in Atlas (Network Access)
- Make sure the username and password in the URI are correct
- Password special characters (like @, #) must be URL-encoded

### "Email transporter warning"
- Make sure 2-Step Verification is ON in your Google account
- Make sure you are using the App Password, not your real Gmail password
- If you copied the password with spaces, try removing them in .env

### "Not allowed by CORS"
- Make sure your HTML is served from `http://127.0.0.1:5500` or `http://localhost:5500`
- Update CLIENT_URL in .env to match your exact frontend URL
- Restart the server after changing .env

### Form submits but shows "Something went wrong"
- Check the terminal where your server is running for error messages
- Make sure the backend is running on port 5001
- Check that API_BASE in the HTML matches your server port

### Port 5001 already in use
Change the PORT in .env to 5002 and update API_BASE in the HTML to match.

---

## Deploying to Production

When you are ready to go live:

**Recommended stack:**
- Backend: Railway (https://railway.app) — free tier, deploys from GitHub
- Frontend: Netlify (https://netlify.com) — drag and drop the HTML file
- Database: MongoDB Atlas (already set up)

**Before deploying:**
1. Set `NODE_ENV=production` in your deployment environment variables
2. Add your production frontend URL to the CORS allowed origins in `app.js`
3. Update `API_BASE` in the HTML from `http://localhost:5001` to your Railway URL
4. Add `0.0.0.0/0` to MongoDB Atlas Network Access (Railway IPs change)

**Railway deployment:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Then add all your .env variables in Railway's dashboard under Variables.

---

## File Reference

| File | What it does |
|---|---|
| `server.js` | Starts the server, connects DB, verifies email |
| `app.js` | Express setup, CORS, middleware, routes |
| `config/db.js` | MongoDB connection |
| `models/Waitlist.js` | Database schema, auto spot numbering |
| `controllers/waitlistController.js` | Join, count, export logic |
| `routes/waitlistRoutes.js` | Maps URLs to controllers |
| `services/emailService.js` | Nodemailer + HTML email template |
| `middleware/validateInput.js` | Input sanitisation and validation |
| `middleware/rateLimiter.js` | Abuse prevention (5 submits/hour/IP) |
| `.env.example` | Template for your .env file |

---

*Vigil Health — Built for Nigeria. Designed for the world.*
