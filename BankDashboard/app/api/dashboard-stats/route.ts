import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import DataRequest from '@/models/DataRequest';
import Employee from '@/models/Employee';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('mydatabase'); // Use mydatabase as specified
    const testDb = client.db('test'); // Use test database for employees

    // Get Active Requests count (total requests)
    let activeRequestsCount = 0;
    try {
      activeRequestsCount = await db
        .collection('userRequests')
        .countDocuments();
    } catch (error) {
      console.error('Error counting active requests:', error);
    }

    // Get Completed Today count (requests with status "completed")
    let completedTodayCount = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      completedTodayCount = await db.collection('userRequests').countDocuments({
        status: 'completed',
        updatedAt: { $gte: today },
      });
    } catch (error) {
      console.error('Error counting completed today:', error);
    }

    // Get Pending Reviews count (all requests except completed)
    let pendingReviewsCount = 0;
    try {
      pendingReviewsCount = await db.collection('userRequests').countDocuments({
        status: { $ne: 'completed' },
      });
    } catch (error) {
      console.error('Error counting pending reviews:', error);
    }

    // Get Team Members count from test database employees collection
    let teamMembersCount = 0;
    try {
      teamMembersCount = await testDb.collection('employees').countDocuments({
        status: 'active',
      });
    } catch (error) {
      console.error('Error counting team members:', error);
    }

    return NextResponse.json({
      activeRequests: activeRequestsCount,
      completedToday: completedTodayCount,
      pendingReviews: pendingReviewsCount,
      teamMembers: teamMembersCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
