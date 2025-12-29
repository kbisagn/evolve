import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';

import WaitingList from '@/models/WaitingList';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  await dbConnect();

  const { id } = await params;

  const waiting = await WaitingList.findByIdAndDelete(id);

  if (!waiting) {

    return NextResponse.json({ error: 'Waiting list entry not found' }, { status: 404 });

  }

  return NextResponse.json({ message: 'Removed from waiting list' });

}