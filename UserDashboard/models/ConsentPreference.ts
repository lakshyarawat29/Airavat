import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentPreference extends Document {
  userID: string;
  transactions: 'Minimal' | 'Moderate' | 'Full';
  accountDetails: 'Minimal' | 'Moderate' | 'Full';
  personalInfo: 'Minimal' | 'Moderate' | 'Full';
  timeLimit: number;
  purposes: {
    loanProcessing: boolean;
    fraudDetection: boolean;
    creditScoring: boolean;
    marketing: boolean;
  };
  additionalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const consentPreferenceSchema = new Schema<IConsentPreference>(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
    transactions: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    accountDetails: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    personalInfo: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
      default: 30,
    },
    purposes: {
      loanProcessing: {
        type: Boolean,
        default: false,
      },
      fraudDetection: {
        type: Boolean,
        default: false,
      },
      creditScoring: {
        type: Boolean,
        default: false,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ConsentPreference ||
  mongoose.model<IConsentPreference>(
    'ConsentPreference',
    consentPreferenceSchema
  );
