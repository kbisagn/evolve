import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';

import Member from '@/models/Member';

export async function GET() {

  await dbConnect();

  const members = await Member.find();

  return NextResponse.json(members);

}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, phone, address, examPrep } = await request.json();

    // Generate memberId: EVOLVE[4digit year][2digit month][001]
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastMember = await Member.findOne().sort({ memberId: -1 });
    let nextNumber = 1;
    if (lastMember && lastMember.memberId) {
      const lastNum = parseInt(lastMember.memberId.slice(-3));
      nextNumber = lastNum + 1;
    }
    const memberId = `EVOLVE${year}${month}${nextNumber.toString().padStart(3, '0')}`;

    const member = new Member({ memberId, name, email, phone, address, examPrep });

    await member.save();

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error in POST /api/members:', error);
    const message = error instanceof Error ? error.message : 'Failed to create member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}