import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  goal: string;
  segment: {
    filters: any;
    audienceSize: number;
  };
  channel: 'email' | 'sms' | 'whatsapp';
  messageTemplate: string;
  status: 'draft' | 'active' | 'completed';
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  aiAnalysis?: string;
  createdAt: Date;
  launchedAt?: Date;
  completedAt?: Date;
}

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  goal: { type: String, required: true },
  segment: {
    filters: { type: Schema.Types.Mixed }, // Parsed segment object
    audienceSize: { type: Number, default: 0 }
  },
  channel: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
  messageTemplate: { type: String, required: true },
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    converted: { type: Number, default: 0 }
  },
  aiAnalysis: { type: String },
  createdAt: { type: Date, default: Date.now },
  launchedAt: { type: Date },
  completedAt: { type: Date }
});

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
