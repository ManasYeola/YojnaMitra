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
  | 'complete'
  | 'menu';

export interface ISessionAnswers {
  name?:          string;
  state?:         string;
  farmerType?:    string;
  landOwnership?: string;
  ageRange?:      string;
  caste?:         string;
  incomeRange?:   string;
  isBPL?:         boolean;
}

export interface IWhatsAppSession extends Document {
  phone:          string;
  state:          SessionState;
  answers:        ISessionAnswers;
  lastActivityAt: Date;
  userId?:        string;
  createdAt:      Date;
  updatedAt:      Date;
}

const whatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      enum: ['new','ask_name','q1_state','q2_farmer_type','q3_land','q4_age','q5_caste','q6_income','q7_bpl','q8_special','complete','menu'],
      default: 'new',
    },
    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete sessions after 24 hours of inactivity
whatsAppSessionSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 86400 });

const WhatsappSession = mongoose.model<IWhatsAppSession>('WhatsappSession', whatsAppSessionSchema);

export default WhatsappSession;
