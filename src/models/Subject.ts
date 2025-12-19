import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  credits: number;
  semester: number;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
      min: 0,
      max: 10,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    branch: {
      type: String,
      default: 'Common',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: same code can exist in different branches
SubjectSchema.index({ code: 1, branch: 1 }, { unique: true });

const Subject: Model<ISubject> = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);

export default Subject;
