import mongoose from 'mongoose';
import './Subject'; // Ensure Subject model is registered before population

const MaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: {
        values: ['1', '2', '3', '4', '5', '6', '7', '8'],
        message: 'Semester must be between 1 and 8',
      },
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      enum: {
        values: [
          'Notes',
          'Question Paper',
          'Assignment',
          'Lab Manual',
          'Reference Book',
          'Syllabus',
          'Other',
        ],
        message: 'Invalid material type',
      },
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);
