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

export interface IWhatsappSession extends Document {
  phone: string;
  state: SessionState;
  answers: {
    name?: string;
    state?: string;
    farmerType?: string;
    landOwnership?: string;
    ageRange?: string;
    caste?: string;
    incomeRange?: string;
    isBPL?: boolean;
    specialCategory?: string[];
  };
  userId?: string;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappSessionSchema = new Schema<IWhatsappSession>(
  {
    phone:           { type: String, required: true, unique: true, index: true },
    state:           { type: String, default: 'new' },
    answers:         { type: Schema.Types.Mixed, default: {} },
    userId:          { type: String },
    lastActivityAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-delete session 24 hours after last activity
whatsappSessionSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const WhatsappSession = mongoose.model<IWhatsappSession>('WhatsappSession', whatsappSessionSchema);
export default WhatsappSession;
