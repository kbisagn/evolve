import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  entity: { type: String, required: true }, // e.g., 'Member', 'Subscription', 'Expense'
  entityId: { type: String },
  details: { type: String },
  performedBy: { type: String }, // User email or name
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model('Log', LogSchema);