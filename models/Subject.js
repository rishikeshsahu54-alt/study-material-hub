import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: {
        values: ['1', '2', '3', '4', '5', '6', '7', '8'],
        message: 'Semester must be between 1 and 8',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate subject for the same semester
SubjectSchema.index({ name: 1, semester: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
