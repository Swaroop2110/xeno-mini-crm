import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunication extends Document {
  campaignId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  message: string;
  channel: 'email' | 'sms' | 'whatsapp';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted';
  statusHistory: Array<{ status: string; timestamp: Date }>;
  idempotencyKeys: string[];
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const communicationSchema = new Schema<ICommunication>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
  status: { 
    type: String, 
    enum: ['queued', 'sent', 'delivered', 'failed', 'opened', 'clicked', 'converted'],
    default: 'queued'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  idempotencyKeys: [{ type: String }],
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
communicationSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Indexes for fast lookups
communicationSchema.index({ campaignId: 1, status: 1 });
communicationSchema.index({ customerId: 1 });
communicationSchema.index({ idempotencyKeys: 1 });

export const Communication = mongoose.model<ICommunication>('Communication', communicationSchema);
