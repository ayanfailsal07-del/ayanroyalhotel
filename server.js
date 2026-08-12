const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');
const Booking = require('./models/Booking');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

const dbReady = () => mongoose.connection.readyState === 1;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const nodemailer = require('nodemailer');
let transporter = null;
let useEmail = false;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('your') && !process.env.EMAIL_PASS.includes('your')) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  useEmail = true;
  // Verify transporter at startup
  transporter.verify().then(() => {
    console.log('[EMAIL] SMTP connection verified successfully');
  }).catch((err) => {
    console.error('[EMAIL] SMTP verification failed:', err.message);
    useEmail = false;
  });
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const entry = { id: Date.now(), name, email, subject, message, receivedAt: new Date().toISOString() };
    const msgs = (() => { try { return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8')); } catch(e) { return []; } })();
    msgs.unshift(entry);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2));

    let dbSaved = false;
    if (dbReady()) {
      try {
        await Message.create({ name, email, subject, message });
        dbSaved = true;
      } catch (dbError) {
        console.error('[CONTACT] DB save failed:', dbError.message);
      }
    }

    let emailSent = false;
    const to = process.env.RECIPIENT_EMAIL || email;

    if (useEmail && transporter && to && !to.includes('your')) {
      try {
        await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
          replyTo: email, to,
          subject: `Contact Form: ${subject}`,
          html: `<html><body><h2>New Contact Message</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Subject:</b> ${subject}</p><hr><p>${message}</p></body></html>`
        });
        emailSent = true;
      } catch (e) {
        console.error('[CONTACT] Email failed:', e.message);
      }
    }

    const savedWhere = [];
    if (emailSent) savedWhere.push('email');
    if (dbSaved) savedWhere.push('database');
    if (!dbSaved) savedWhere.push('file');

    res.json({
      success: true,
      message: emailSent ? 'Message sent to email!' : 'Message saved!',
      emailSent, saved: savedWhere
    });
  } catch (error) {
    console.error('[CONTACT] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error. Try again.' });
  }
});

app.post('/api/booking', async (req, res) => {
  try {
    const { fullName, email, phone, gender, address, roomType, guests, checkin, checkout, rooms, bedPref, extras, requests, contactMethod } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const bookingEntry = {
      id: Date.now(), fullName, email, phone, gender, address, roomType,
      guests, checkin, checkout, rooms, bedPref, extras, requests, contactMethod,
      receivedAt: new Date().toISOString(),
    };
    const bookings = (() => { try { return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf-8')); } catch(e) { return []; } })();
    bookings.unshift(bookingEntry);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    let dbSaved = false;
    if (dbReady()) {
      try {
        await Booking.create(bookingEntry);
        dbSaved = true;
      } catch (dbError) {
        console.error('[BOOKING] DB save failed:', dbError.message);
      }
    }

    let emailSent = false;
    let emailError = null;
    const to = process.env.RECIPIENT_EMAIL || email;

    if (useEmail && transporter && to && !to.includes('your')) {
      try {
        await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
          replyTo: email, to,
          subject: `New Booking - ${fullName}`,
          html: `<html><body style="font-family:Arial;max-width:600px;margin:auto">
<h2 style="color:#d4a017">New Hotel Booking</h2>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Name</td><td style="padding:8px;border:1px solid #ddd">${fullName}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Gender</td><td style="padding:8px;border:1px solid #ddd">${gender || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Address</td><td style="padding:8px;border:1px solid #ddd">${address || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Room Type</td><td style="padding:8px;border:1px solid #ddd">${roomType || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Guests</td><td style="padding:8px;border:1px solid #ddd">${guests || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Check-in</td><td style="padding:8px;border:1px solid #ddd">${checkin}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Check-out</td><td style="padding:8px;border:1px solid #ddd">${checkout}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Rooms</td><td style="padding:8px;border:1px solid #ddd">${rooms || '1'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Bed Preference</td><td style="padding:8px;border:1px solid #ddd">${bedPref || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Extras</td><td style="padding:8px;border:1px solid #ddd">${extras || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Special Requests</td><td style="padding:8px;border:1px solid #ddd">${requests || '-'}</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Contact Method</td><td style="padding:8px;border:1px solid #ddd">${contactMethod || '-'}</td></tr>
</table>
<p style="color:#64748b;margin-top:16px">Received at ${new Date().toLocaleString()}</p></body></html>`
        });
        emailSent = true;
      } catch (e) {
        console.error('[BOOKING] Email failed:', e.message);
        emailError = e.message;
      }
    }

    res.json({ success: true, message: emailSent ? 'Booking confirmed! Email sent.' : 'Booking confirmed (email pending).', emailSent, emailError, saved: dbSaved ? 'database' : 'file' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Error booking.' });
  }
});

const LOGIN_RECIPIENTS = ['ayanfailsal07@gmail.com', 'eshufaisal001@gmail.com'];

const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const emailLower = email.toLowerCase().trim();
    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore[emailLower] = { name, email: emailLower, password, otp, expiry, verified: false };
    console.log(`[OTP] Generated for ${emailLower}: ${otp}`);

    let emailSent = false;
    if (useEmail && transporter) {
      try {
        await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
          to: emailLower,
          subject: 'Your OTP Code - Ayaan Royale Hotel',
          html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
            <h2 style="color:#1e293b;margin:0 0 16px">Email Verification</h2>
            <p style="color:#475569;font-size:15px;margin:0 0 8px">Hello ${name},</p>
            <p style="color:#475569;font-size:15px;margin:0 0 20px">Your one-time code is:</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px">
              <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:13px;margin:0">This code expires in 5 minutes.</p>
          </div>`
        });
        console.log(`[OTP] Email sent to ${emailLower}`);
        emailSent = true;
      } catch (e) {
        console.error(`[OTP] Email failed for ${emailLower}:`, e.message, e.code || '');
      }
    }

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'OTP email failed to send. Check your email address or try again later.', email: emailLower });
    }

    res.json({ success: true, message: 'OTP sent to your email', email: emailLower });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Signup error. Try again.' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    const emailLower = email.toLowerCase().trim();
    const record = otpStore[emailLower];
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please sign up again.' });
    }
    if (Date.now() > record.expiry) {
      delete otpStore[emailLower];
      return res.status(400).json({ success: false, message: 'OTP expired. Please sign up again.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    record.verified = true;
    delete otpStore[emailLower];

    // Save user to MongoDB Atlas
    let user;
    try {
      user = await User.create({
        name: record.name,
        email: emailLower,
        password: record.password,
      });
    } catch (dbError) {
      console.error('[SIGNUP] DB Error:', dbError.message, dbError.code, dbError);
      if (dbError.code === 11000) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to create account. Try again.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userName = record.name;
    let emailsSent = false;
    if (useEmail && transporter) {
      try {
        const signupTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
        const htmlContent = `<html><body style="font-family:Arial;max-width:600px;margin:auto">
          <h2 style="color:#059669">New Signup Verified - Ayaan Royale Hotel</h2>
          <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Name</td><td style="padding:8px;border:1px solid #ddd">${userName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Email</td><td style="padding:8px;border:1px solid #ddd">${emailLower}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Verified At</td><td style="padding:8px;border:1px solid #ddd">${signupTime}</td></tr>
          </table></body></html>`;
        for (const recipient of LOGIN_RECIPIENTS) {
          try {
            await transporter.sendMail({
              from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
              to: recipient, subject: `Signup Verified: ${userName} (${emailLower})`, html: htmlContent
            });
            console.log(`[SIGNUP EMAIL] Sent to ${recipient}`);
          } catch (e) { console.error(`[SIGNUP EMAIL] Failed:`, e.message); }
        }
        emailsSent = true;
      } catch (e) { console.error('[SIGNUP EMAIL] Error:', e.message); }
    }

    res.json({ success: true, message: 'Account verified successfully', name: userName, email: emailLower, token, emailsSent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification error. Try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const emailLower = email.toLowerCase().trim();
    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore['login_' + emailLower] = { email: emailLower, password, otp, expiry };
    console.log(`[OTP-LOGIN] Generated for ${emailLower}: ${otp}`);

    let emailSent = false;
    if (useEmail && transporter) {
      try {
        await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
          to: emailLower,
          subject: 'Your OTP Code - Ayaan Royale Hotel',
          html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
            <h2 style="color:#1e293b;margin:0 0 16px">Login Verification</h2>
            <p style="color:#475569;font-size:15px;margin:0 0 8px">Hello,</p>
            <p style="color:#475569;font-size:15px;margin:0 0 20px">Your one-time login code is:</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px">
              <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:13px;margin:0">This code expires in 5 minutes.</p>
          </div>`
        });
        console.log(`[OTP-LOGIN] Email sent to ${emailLower}`);
        emailSent = true;
      } catch (e) {
        console.error(`[OTP-LOGIN] Email failed for ${emailLower}:`, e.message, e.code || '');
      }
    }

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'OTP email failed to send. Check your email address or try again later.', email: emailLower });
    }

    res.json({ success: true, message: 'OTP sent to your email for login', email: emailLower });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login error. Try again.' });
  }
});

app.post('/api/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    const emailLower = email.toLowerCase().trim();
    const key = 'login_' + emailLower;
    const record = otpStore[key];
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please login again.' });
    }
    if (Date.now() > record.expiry) {
      delete otpStore[key];
      return res.status(400).json({ success: false, message: 'OTP expired. Please login again.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    delete otpStore[key];

    // Find user in MongoDB and verify password
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
    }

    const isPasswordValid = await user.comparePassword(record.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    let emailsSent = false;
    if (useEmail && transporter) {
      try {
        const loginTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
        const htmlContent = `<html><body style="font-family:Arial;max-width:600px;margin:auto">
          <h2 style="color:#d4a017">Login Alert - Ayaan Royale Hotel</h2>
          <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Name</td><td style="padding:8px;border:1px solid #ddd">${user.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Email</td><td style="padding:8px;border:1px solid #ddd">${emailLower}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:600">Login Time</td><td style="padding:8px;border:1px solid #ddd">${loginTime}</td></tr>
          </table></body></html>`;
        for (const recipient of LOGIN_RECIPIENTS) {
          try {
            await transporter.sendMail({
              from: `"${process.env.SENDER_NAME || 'Ayaan Royale'}" <${process.env.EMAIL_USER}>`,
              to: recipient, subject: `Login Alert: ${user.name} (${emailLower})`, html: htmlContent
            });
            console.log(`[LOGIN EMAIL] Sent to ${recipient}`);
          } catch (e) { console.error(`[LOGIN EMAIL] Failed to ${recipient}:`, e.message); }
        }
        emailsSent = true;
      } catch (e) { console.error('[LOGIN EMAIL] Error:', e.message); }
    }
    res.json({ success: true, message: 'Login successful', name: user.name, email: emailLower, token, emailsSent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login verification error.' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    if (dbReady()) {
      const msgs = await Message.find().sort({ receivedAt: -1 }).limit(200);
      return res.json(msgs.map((m) => ({ id: m._id, name: m.name, email: m.email, subject: m.subject, message: m.message, receivedAt: m.receivedAt.toISOString() })));
    }
    res.json(JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8')));
  } catch(e) { res.json([]); }
});

app.get('/api/bookings', async (req, res) => {
  try {
    if (dbReady()) {
      const bookings = await Booking.find().sort({ createdAt: -1 }).limit(200);
      return res.json(bookings);
    }
    res.json(JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf-8')));
  } catch(e) { res.json([]); }
});

app.get('/api/health', (req, res) => {
  res.json({
    emailConfigured: useEmail && !!transporter,
    emailRecipient: process.env.RECIPIENT_EMAIL || null,
    databaseConnected: dbReady(),
    time: new Date().toISOString(),
  });
});

app.get('/admin', (req, res) => {
  res.send(`
    <html><head><title>Messages - Ayaan Royale Hotel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body{font-family:Arial;padding:20px;background:#f5f5f5;max-width:1100px;margin:auto}
      h1{color:#d4a017;border-bottom:2px solid #d4a017;padding-bottom:10px}
      .tabs{display:flex;gap:8px;margin:20px 0}
      .tab{padding:10px 20px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;color:#475569}
      .tab.active{background:#d4a017;color:#fff;border-color:#d4a017}
      .msg{background:#fff;border-radius:8px;padding:15px;margin:10px 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}
      .msg h3{margin:0 0 5px;color:#1e293b}
      .msg small{color:#64748b}
      .msg p{margin:8px 0;color:#334155}
      .label{display:inline-block;background:#d4a017;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px}
      .empty{text-align:center;color:#94a3b8;padding:40px;font-size:18px}
      .refresh{float:right;background:#d4a017;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer}
      table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1)}
      th,td{text-align:left;padding:10px;border-bottom:1px solid #eee;font-size:14px;vertical-align:top}
      th{background:#1a1a2e;color:#fff}
      tr:hover{background:#f8f6f1}
    </style></head><body>
    <h1>Dashboard - Ayaan Royale Hotel <button class="refresh" onclick="load()">Refresh</button></h1>
    <div class="tabs">
      <button class="tab active" id="tabMsg" onclick="show('msg')">Contact Messages</button>
      <button class="tab" id="tabBook" onclick="show('book')">Bookings</button>
    </div>
    <div id="content">Loading...</div>
    <script>
      let mode = 'msg';
      function show(m) {
        mode = m;
        document.getElementById('tabMsg').className = 'tab' + (m === 'msg' ? ' active' : '');
        document.getElementById('tabBook').className = 'tab' + (m === 'book' ? ' active' : '');
        load();
      }
      function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      async function load() {
        const c = document.getElementById('content');
        try {
          if (mode === 'msg') {
            const d = await fetch('/api/messages').then(r => r.json());
            if (!d.length) { c.innerHTML = '<div class="empty">No messages yet</div>'; return; }
            c.innerHTML = d.map(m => '<div class="msg"><h3>' + esc(m.name) + ' <small>(' + esc(m.email) + ')</small></h3><span class="label">' + esc(m.subject) + '</span><small style="float:right">' + new Date(m.receivedAt).toLocaleString() + '</small><p>' + esc(m.message) + '</p></div>').join('');
          } else {
            const d = await fetch('/api/bookings').then(r => r.json());
            if (!d.length) { c.innerHTML = '<div class="empty">No bookings yet</div>'; return; }
            c.innerHTML = '<table><tr><th>Name</th><th>Contact</th><th>Room</th><th>Dates</th><th>Details</th></tr>' + d.map(b => {
              const when = (b.checkin || '-') + ' → ' + (b.checkout || '-');
              const details = [];
              if (b.guests) details.push('Guests: ' + b.guests);
              if (b.rooms) details.push('Rooms: ' + b.rooms);
              if (b.bedPref) details.push('Bed: ' + b.bedPref);
              if (b.gender) details.push('Gender: ' + b.gender);
              if (b.address) details.push('Address: ' + b.address);
              if (b.extras) details.push('Extras: ' + b.extras);
              if (b.requests) details.push('Requests: ' + b.requests);
              return '<tr><td><b>' + esc(b.fullName) + '</b><br><small>' + new Date(b.createdAt || b.receivedAt).toLocaleString() + '</small></td>' +
                '<td>' + esc(b.email || '-') + '<br>' + esc(b.phone || '-') + '</td>' +
                '<td>' + esc(b.roomType || '-') + '</td><td>' + esc(when) + '</td>' +
                '<td>' + esc(details.join('<br>') || '-') + '</td></tr>';
            }).join('') + '</table>';
          }
        } catch (e) {
          c.innerHTML = '<div class="empty">Error loading: ' + esc(e.message) + '</div>';
        }
      }
      load();
    </script></body></html>
  `);
});

// Protected route - only accessible with valid JWT
app.get('/api/protected', auth, (req, res) => {
  res.json({
    success: true,
    message: 'You have access to protected content!',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

// Prevent server from crashing on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('  Ayaan Royale Hotel Server');
    console.log('========================================');
    console.log('  Website:  http://localhost:' + PORT);
    console.log('  Messages: http://localhost:' + PORT + '/admin');
    console.log('  API:      http://localhost:' + PORT + '/api');
    console.log('  Email:    ' + (useEmail?'ON':'OFF (configure .env)'));
    console.log('========================================');
    if (process.env.NODE_ENV !== 'production') {
      const url = 'http://localhost:' + PORT;
      const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      require('child_process').exec(start + ' ' + url);
    }
  });
});
