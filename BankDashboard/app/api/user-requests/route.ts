import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('mydatabase');
    const requests = await db.collection('userRequests').find({}).toArray();

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('mydatabase');
    const collection = db.collection('userRequests');

    const newRequest = await request.json();

    if (!newRequest.id) {
      return NextResponse.json(
        { error: 'Missing request ID' },
        { status: 400 }
      );
    }

    // Upsert logic - update existing request or insert new one
    await collection.updateOne(
      { id: newRequest.id },
      {
        $set: {
          thirdParty: newRequest.thirdParty,
          requestType: newRequest.requestType,
          userId: newRequest.userId,
          status: newRequest.status,
          timestamp: newRequest.timestamp,
          currentAgent: newRequest.currentAgent,
        },
        $addToSet: {
          completedAgents: { $each: newRequest.completedAgents || [] },
          logs: { $each: newRequest.logs || [] },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Request upserted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to upsert request' },
      { status: 500 }
    );
  }
}
