import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  token: string;
  phone: string;
  userId?: string;
  eligibleSchemeIds: string[];
  view: 'schemes' | 'insurance' | 'financial' | 'all';
  expiresAt: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    token: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    userId: { type: String },
    eligibleSchemeIds: { type: [String], default: [] },
    view: {
      type: String,
      enum: ['schemes', 'insurance', 'financial', 'all'],
      default: 'all',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL index — MongoDB auto-deletes documents after expiresAt
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);
