import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find().select('email name role');
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}