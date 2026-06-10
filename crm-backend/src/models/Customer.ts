import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  city: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate: Date;
  churnScore: number;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  city: { type: String, required: true },
  totalSpend: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  churnScore: { type: Number, default: 0, min: 0, max: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for fast segmentation and sorting
customerSchema.index({ lastOrderDate: -1 });
customerSchema.index({ totalSpend: -1 });
customerSchema.index({ churnScore: -1 });
customerSchema.index({ city: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
