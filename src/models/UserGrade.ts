import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserGrade extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  grade: string;
  gradePoints: number;
  semester: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserGradeSchema = new Schema<IUserGrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: ['A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'F'],
    },
    gradePoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one grade per subject per user per semester per year
UserGradeSchema.index(
  { userId: 1, subjectId: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Index for efficient queries
UserGradeSchema.index({ userId: 1, semester: 1 });

const UserGrade: Model<IUserGrade> = mongoose.models.UserGrade || mongoose.model<IUserGrade>('UserGrade', UserGradeSchema);

export default UserGrade;
