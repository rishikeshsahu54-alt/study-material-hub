import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = verifyAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [totalMaterials, totalSubjects, downloadStats, recentMaterials] = await Promise.all([
      Material.countDocuments(),
      Subject.countDocuments(),
      Material.aggregate([
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloads' },
          },
        },
      ]),
      Material.find()
        .populate('subject', 'name semester')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalDownloads = downloadStats[0]?.totalDownloads || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMaterials,
        totalSubjects,
        totalDownloads,
        recentMaterials,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats: ' + error.message },
      { status: 500 }
    );
  }
}
