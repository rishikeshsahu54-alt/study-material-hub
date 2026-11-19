import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import { verifyAdminRequest } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const VALID_SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const VALID_TYPES = [
  'Notes',
  'Question Paper',
  'Assignment',
  'Lab Manual',
  'Reference Book',
  'Syllabus',
  'Other',
];

function generateSafeFileName(originalName) {
  const ext = path.extname(originalName || '').toLowerCase() || '.pdf';
  const cleanExt = ext === '.pdf' ? '.pdf' : '.pdf';
  const rawBase = path.basename(originalName || 'document', ext);
  const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}_${randomSuffix}_${safeBase}${cleanExt}`;
}

// GET /api/materials/[id] - Public: retrieve single material
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Material ID format' }, { status: 400 });
    }

    await connectDB();
    const material = await Material.findById(id).populate('subject', 'name semester description').lean();

    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    console.error('GET /api/materials/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch material: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/materials/[id] - Admin only: edit material details and optional PDF replacement
export async function PUT(request, { params }) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Material ID format' }, { status: 400 });
    }

    await connectDB();
    const existingMaterial = await Material.findById(id);
    if (!existingMaterial) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let title, description, subjectId, semester, materialType, replacementFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = formData.get('title')?.toString().trim();
      description = formData.get('description')?.toString().trim();
      subjectId = formData.get('subject')?.toString().trim();
      semester = formData.get('semester')?.toString().trim();
      materialType = formData.get('materialType')?.toString().trim();
      const file = formData.get('file');
      if (file && typeof file !== 'string' && file.size > 0) {
        replacementFile = file;
      }
    } else {
      const body = await request.json();
      title = body.title?.trim();
      description = body.description?.trim();
      subjectId = body.subject?.trim();
      semester = body.semester?.trim();
      materialType = body.materialType?.trim();
    }

    // Validate fields if provided
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ success: false, error: 'Title cannot exceed 200 characters' }, { status: 400 });
    }

    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
    }
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return NextResponse.json({ success: false, error: 'Selected subject does not exist' }, { status: 400 });
    }

    if (!semester || !VALID_SEMESTERS.includes(semester)) {
      return NextResponse.json({ success: false, error: 'Valid semester (1-8) is required' }, { status: 400 });
    }

    if (!materialType || !VALID_TYPES.includes(materialType)) {
      return NextResponse.json(
        { success: false, error: `Invalid material type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const updateFields = {
      title,
      description: description || '',
      subject: subjectId,
      semester,
      materialType,
    };

    // If replacement PDF is uploaded
    if (replacementFile) {
      if (replacementFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 10 MB limit' },
          { status: 400 }
        );
      }

      const fileExt = path.extname(replacementFile.name || '').toLowerCase();
      if (fileExt !== '.pdf') {
        return NextResponse.json(
          { success: false, error: 'Only PDF (.pdf) documents are permitted' },
          { status: 400 }
        );
      }

      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      if (!existsSync(uploadsDir)) {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      const newSafeName = generateSafeFileName(replacementFile.name);
      const newFilePath = path.join(uploadsDir, newSafeName);

      // Write new file
      const arrayBuffer = await replacementFile.arrayBuffer();
      await fs.writeFile(newFilePath, Buffer.from(arrayBuffer));

      // Delete old file if it existed
      const oldFilePath = existingMaterial.filePath;
      if (oldFilePath && existsSync(oldFilePath)) {
        try {
          await fs.unlink(oldFilePath);
        } catch (unlinkErr) {
          console.warn('Could not delete old file:', unlinkErr.message);
        }
      }

      updateFields.fileName = newSafeName;
      updateFields.filePath = newFilePath;
      updateFields.fileSize = replacementFile.size;
    }

    const updated = await Material.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name semester');

    return NextResponse.json({
      success: true,
      message: 'Material updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/materials/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update material: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - Admin only: delete material & local PDF file
export async function DELETE(request, { params }) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Material ID format' }, { status: 400 });
    }

    await connectDB();
    const material = await Material.findById(id);
    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    // Delete associated local PDF file
    if (material.filePath && existsSync(material.filePath)) {
      try {
        await fs.unlink(material.filePath);
      } catch (fileErr) {
        console.warn('Could not remove local PDF file:', fileErr.message);
      }
    }

    await Material.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Material '${material.title}' and its associated file were deleted successfully`,
    });
  } catch (error) {
    console.error('DELETE /api/materials/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete material: ' + error.message },
      { status: 500 }
    );
  }
}
