import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ hints: [] });
    }

    const searchTerm = query.trim();

    await dbConnect();

    // Search by memberId, name, email, or phone
    const members = await Member.find({
      $or: [
        { memberId: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('memberId name email phone')
    .limit(10)
    .lean();

    // Format hints for display
    const hints = members.map(member => ({
      memberId: member.memberId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      displayText: `${member.name} (${member.memberId}) - ${member.phone}`
    }));

    return NextResponse.json({ hints });

  } catch (error) {
    console.error('Error in verify search API:', error);
    return NextResponse.json(
      { error: 'Internal server error', hints: [] },
      { status: 500 }
    );
  }
}
