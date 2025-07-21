import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Agent code to index mapping
const AGENT_MAP: Record<string, number> = {
  VRA: 1,
  RBA: 2,
  ZBKA: 3,
  DRA: 4,
  TLSA: 5,
  TMA: 6,
  OCA: 7,
  BBA: 8,
};

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

    const reqBody = await request.json();
    const { transactionID, status, CompletionTimeStamp, msg } = reqBody;

    if (!transactionID) {
      return NextResponse.json(
        { error: 'Missing transactionID' },
        { status: 400 }
      );
    }

    // Handle completed or terminated status upsert
    if (status === 'completed' || status === 'terminated') {
      const now = CompletionTimeStamp || new Date().toISOString();
      const logEntry = {
        id: `log-${Date.now()}`,
        message: msg || '',
        timestamp: now.split('T')[1]?.split('Z')[0] || now,
        status,
      };
      await collection.updateOne(
        { id: transactionID },
        {
          $set: {
            status,
            CompletionTimeStamp: now,
          },
          $addToSet: {
            logs: logEntry,
          },
        },
        { upsert: true }
      );
      return NextResponse.json({ message: `Request marked as ${status}` });
    }

    const now = new Date().toISOString();
    const existingDoc = await collection.findOne({ id: transactionID });

    const agentIndex = reqBody.agent ? AGENT_MAP[reqBody.agent] || null : null;

    const logEntry = {
      id: `log-${Date.now()}`,
      message: reqBody.msg || 'No message provided',
      timestamp: now.split('T')[1]?.split('Z')[0] || now,
      agentId: agentIndex,
    };

    let updatePayload: any = {
      $addToSet: {
        logs: logEntry,
      },
    };

    // Initial Request Handler
    if (
      reqBody.source &&
      reqBody.data_requested &&
      reqBody.userHash &&
      reqBody.StartingTimeStamp
    ) {
      updatePayload.$set = {
        id: transactionID,
        thirdParty: reqBody.source,
        requestType: reqBody.data_requested,
        userId: reqBody.userHash,
        timestamp: reqBody.StartingTimeStamp,
        status: reqBody.status || 'pending',
        currentAgent: null,
      };

      updatePayload.$setOnInsert = {
        completedAgents: [],
      };
    }

    // Agent Update Handler
    // Agent Update Handler
    if (reqBody.agent && reqBody.type) {
      updatePayload.$set = {
        ...(updatePayload.$set || {}),
      };

      if (reqBody.type === 'execution_started') {
        updatePayload.$set.currentAgent = agentIndex;
      }

      if (reqBody.type === 'execution_completed' && agentIndex !== null) {
        updatePayload.$addToSet.completedAgents = agentIndex;

        // Set currentAgent to next agent if not final (8), else keep it as is
        if (agentIndex < 8) {
          updatePayload.$set.currentAgent = agentIndex + 1;
        } else {
          updatePayload.$set.currentAgent =
            existingDoc?.currentAgent || agentIndex;
        }
      }
    }

    await collection.updateOne({ id: transactionID }, updatePayload, {
      upsert: true,
    });

    return NextResponse.json({ message: 'Request upserted successfully' });
  } catch (error) {
    console.error('POST /userRequests error:', error);
    return NextResponse.json(
      { error: 'Failed to upsert request' },
      { status: 500 }
    );
  }
}
