import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';

// GET /api/downloads/[id] - Controlled file download endpoint
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Material ID' }, { status: 400 });
    }

    await connectDB();
    const material = await Material.findById(id);

    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    // Path traversal defense: verify filePath stays within uploads directory
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const resolvedFilePath = path.resolve(material.filePath);

    if (!resolvedFilePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { success: false, error: 'Access denied: Invalid file path' },
        { status: 403 }
      );
    }

    if (!existsSync(resolvedFilePath)) {
      return NextResponse.json(
        { success: false, error: 'Physical PDF file was not found on server disk' },
        { status: 404 }
      );
    }

    // Read the file buffer
    const fileBuffer = await fs.readFile(resolvedFilePath);

    // Increment download count only after file is confirmed and read
    await Material.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    // Sanitize download attachment name
    const sanitizedTitle = material.title
      .replace(/[^a-zA-Z0-9_\-\. ]/g, '_')
      .trim()
      .slice(0, 80);
    const downloadFileName = `${sanitizedTitle || 'study-material'}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadFileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('GET /api/downloads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Download failed: ' + error.message },
      { status: 500 }
    );
  }
}
