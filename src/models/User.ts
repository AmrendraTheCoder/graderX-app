import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'student' | 'admin';
  branch?: string;
  currentSemester: number;
  currentAcademicYear: string;
  isLnmiitEmail: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    branch: {
      type: String,
      trim: true,
    },
    currentSemester: {
      type: Number,
      default: 1,
      min: 1,
      max: 8,
    },
    currentAcademicYear: {
      type: String,
      default: '2024-25',
    },
    isLnmiitEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
