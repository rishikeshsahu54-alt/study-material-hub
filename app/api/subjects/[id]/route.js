import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import Material from '@/models/Material';
import { verifyAdminRequest } from '@/lib/auth';

// PUT /api/subjects/[id] - Admin only: update subject
export async function PUT(request, { params }) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Subject ID format' }, { status: 400 });
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

    // Check for duplicate with different ID
    const duplicate = await Subject.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      semester: String(semester),
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `Another subject named '${name.trim()}' already exists for Semester ${semester}` },
        { status: 409 }
      );
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        semester: String(semester),
        description: description ? description.trim() : '',
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/subjects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subject: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/subjects/[id] - Admin only: delete subject if no materials assigned
export async function DELETE(request, { params }) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Subject ID format' }, { status: 400 });
    }

    await connectDB();

    // Check if subject exists
    const subject = await Subject.findById(id);
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
    }

    // Check if any materials are assigned to this subject
    const materialCount = await Material.countDocuments({ subject: id });
    if (materialCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete '${subject.name}': There are ${materialCount} study material(s) assigned to this subject. Please delete or reassign those materials first.`,
        },
        { status: 400 }
      );
    }

    await Subject.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Subject '${subject.name}' deleted successfully`,
    });
  } catch (error) {
    console.error('DELETE /api/subjects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subject: ' + error.message },
      { status: 500 }
    );
  }
}
