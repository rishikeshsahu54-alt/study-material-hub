import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import { verifyAdminRequest } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
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

// Helper to sanitize file names safely
function generateSafeFileName(originalName) {
  const ext = path.extname(originalName || '').toLowerCase() || '.pdf';
  const cleanExt = ext === '.pdf' ? '.pdf' : '.pdf';
  const rawBase = path.basename(originalName || 'document', ext);
  // remove all non-alphanumeric chars except dash and underscore
  const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}_${randomSuffix}_${safeBase}${cleanExt}`;
}

// GET /api/materials - Public: search, filter, paginate materials
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() || '';
    const semester = searchParams.get('semester')?.trim() || '';
    const materialType = searchParams.get('materialType')?.trim() || '';
    const subjectId = searchParams.get('subject')?.trim() || '';
    const sortBy = searchParams.get('sortBy')?.trim() || 'recent'; // 'recent', 'popular', 'title'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const query = {};

    // Filter by semester
    if (semester && VALID_SEMESTERS.includes(semester)) {
      query.semester = semester;
    }

    // Filter by materialType
    if (materialType && VALID_TYPES.includes(materialType)) {
      query.materialType = materialType;
    }

    // Filter by specific subject ID
    if (subjectId) {
      query.subject = subjectId;
    }

    // Search by title OR subject name
    if (search) {
      const matchingSubjects = await Subject.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');

      const subjectIds = matchingSubjects.map((s) => s._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $in: subjectIds } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default: most recent
    if (sortBy === 'popular') {
      sortOptions = { downloads: -1, createdAt: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const skip = (page - 1) * limit;

    const [materials, totalCount] = await Promise.all([
      Material.find(query)
        .populate('subject', 'name semester')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Material.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch materials: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/materials - Admin only: upload a new study material
export async function POST(request) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    await connectDB();
    const formData = await request.formData();

    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim() || '';
    const subjectId = formData.get('subject')?.toString().trim();
    const semester = formData.get('semester')?.toString().trim();
    const materialType = formData.get('materialType')?.toString().trim();
    const file = formData.get('file');

    // Validation
    if (!title) {
      return NextResponse.json({ success: false, error: 'Material title is required' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ success: false, error: 'Title cannot exceed 200 characters' }, { status: 400 });
    }

    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
    }

    // Verify subject exists
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

    // File validation
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'A PDF file is required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10 MB limit. Please upload a smaller file.' },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name || '').toLowerCase();
    if (fileExt !== '.pdf' || (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== 'application/octet-stream')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF (.pdf) documents are permitted.' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate safe unique filename
    const safeName = generateSafeFileName(file.name);
    const destinationPath = path.join(uploadsDir, safeName);

    // Write file to uploads directory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    // Create material record in MongoDB
    const newMaterial = await Material.create({
      title,
      description,
      subject: subjectId,
      semester,
      materialType,
      fileName: safeName,
      filePath: destinationPath,
      fileSize: file.size,
      downloads: 0,
    });

    const populatedMaterial = await Material.findById(newMaterial._id).populate('subject', 'name semester');

    return NextResponse.json(
      {
        success: true,
        message: 'Material uploaded successfully',
        data: populatedMaterial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload material: ' + error.message },
      { status: 500 }
    );
  }
}
