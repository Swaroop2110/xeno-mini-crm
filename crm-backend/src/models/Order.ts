import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  amount: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  channel: 'online' | 'in-store';
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  channel: { type: String, enum: ['online', 'in-store'], required: true },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.index({ customerId: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
