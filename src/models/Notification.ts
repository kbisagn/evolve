import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['subscription_expiry', 'payment_overdue', 'seat_available', 'system_alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    memberId: String,
    subscriptionId: String,
    seatId: String,
    amount: Number,
    date: Date
  },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);