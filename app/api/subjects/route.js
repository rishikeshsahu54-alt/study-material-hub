import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import { verifyAdminRequest } from '@/lib/auth';

// GET /api/subjects - Public: retrieve list of subjects
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');

    const query = {};
    if (semester) {
      query.semester = semester;
    }

    const subjects = await Subject.find(query).sort({ semester: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    console.error('GET /api/subjects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Admin only: create a new subject
export async function POST(request) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { name, semester, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Subject name is required' }, { status: 400 });
    }

    if (!semester || !['1', '2', '3', '4', '5', '6', '7', '8'].includes(String(semester))) {
      return NextResponse.json({ success: false, error: 'Valid semester (1-8) is required' }, { status: 400 });
    }

    // Check duplicate
    const existing = await Subject.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      semester: String(semester),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Subject '${name.trim()}' already exists for Semester ${semester}` },
        { status: 409 }
      );
    }

    const subject = await Subject.create({
      name: name.trim(),
      semester: String(semester),
      description: description ? description.trim() : '',
    });

    return NextResponse.json(
      { success: true, message: 'Subject created successfully', data: subject },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/subjects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subject: ' + error.message },
      { status: 500 }
    );
  }
}
