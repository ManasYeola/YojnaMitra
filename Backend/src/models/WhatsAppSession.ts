import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSession extends Document {
  phoneNumber: string;
  stage: 'greeting' | 'state' | 'occupation' | 'landOwnership' | 'age' | 'caste' | 'income' | 'bpl' | 'specialCategory' | 'done';
  state: string;
  occupationType: string;
  landOwnership: string;
  age: string;
  casteCategory: string;
  income: string;
  bplCard: string;
  specialCategories: string[];
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
    stage: {
      type: String,
      enum: ['greeting', 'state', 'occupation', 'landOwnership', 'age', 'caste', 'income', 'bpl', 'specialCategory', 'done'],
      default: 'greeting',
    },
    state: {
      type: String,
      default: '',
    },
    occupationType: {
      type: String,
      default: '',
    },
    landOwnership: {
      type: String,
      default: '',
    },
    age: {
      type: String,
      default: '',
    },
    casteCategory: {
      type: String,
      default: '',
    },
    income: {
      type: String,
      default: '',
    },
    bplCard: {
      type: String,
      default: '',
    },
    specialCategories: {
      type: [String],
      default: [],
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
