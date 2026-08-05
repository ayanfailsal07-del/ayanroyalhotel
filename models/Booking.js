const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  gender: { type: String },
  address: { type: String },
  roomType: { type: String },
  guests: { type: Number },
  checkin: { type: String },
  checkout: { type: String },
  rooms: { type: Number },
  bedPref: { type: String },
  extras: { type: String },
  requests: { type: String },
  contactMethod: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
