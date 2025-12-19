import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICGPACalculation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  semester: number;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const CGPACalculationSchema = new Schema<ICGPACalculation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    semester: {
      type: Number,
      required: true,
      min: 0, // 0 represents overall CGPA
      max: 8,
    },
    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    totalCredits: {
      type: Number,
      required: true,
      min: 0,
    },
    totalGradePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one calculation per user per semester per year
CGPACalculationSchema.index(
  { userId: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

const CGPACalculation: Model<ICGPACalculation> = 
  mongoose.models.CGPACalculation || mongoose.model<ICGPACalculation>('CGPACalculation', CGPACalculationSchema);

export default CGPACalculation;
