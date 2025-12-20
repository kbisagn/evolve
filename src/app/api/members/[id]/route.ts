import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';

import Member from '@/models/Member';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const { id } = await params;

  const { name, email, phone, address, examPrep } = await request.json();

  const member = await Member.findByIdAndUpdate(id, { name, email, phone, address, examPrep }, { new: true });

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const { id } = await params;

  const member = await Member.findByIdAndDelete(id);

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Member deleted' });
}