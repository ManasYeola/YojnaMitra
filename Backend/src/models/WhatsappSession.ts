import mongoose, { Schema, Document } from 'mongoose';

export type SessionState =
  | 'new'
  | 'ask_name'
  | 'q1_state'
  | 'q2_farmer_type'
  | 'q3_land'
  | 'q4_age'
  | 'q5_caste'
  | 'q6_income'
  | 'q7_bpl'
  | 'q8_special'
  | 'menu'
  | 'complete';

export interface SessionAnswers {
  name?: string;
  state?: string;
  farmerType?: string;
  landOwnership?: string;
  ageRange?: string;
  caste?: string;
  incomeRange?: string;
  isBPL?: boolean;
  specialCategory?: string[];
}

export interface IWhatsAppSession extends Document {
  phoneNumber: string;
  state: string;
  answers: SessionAnswers;
  userId?: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      default: 'new',
    },
    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: String,
      default: '',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete sessions older than 24 hours
whatsAppSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

const WhatsAppSession = mongoose.model<IWhatsAppSession>('WhatsAppSession', whatsAppSessionSchema);

export default WhatsAppSession;
