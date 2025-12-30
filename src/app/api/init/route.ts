import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import dbConnect from '@/lib/mongodb';

import Seat from '@/models/Seat';
import User from '@/models/User';

export async function POST() {
  await dbConnect();

  // Initialize seats
  const existingSeats = await Seat.countDocuments();
  if (existingSeats === 0) {
    const seats = [];
    for (let i = 1; i <= 46; i++) {
      seats.push({ seatNumber: i, status: 'vacant' });
    }
    await Seat.insertMany(seats);
  }

  // Initialize admin user
  const existingUsers = await User.countDocuments();
  if (existingUsers === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'Admin',
    });
  }

  return NextResponse.json({ message: 'Database initialized' });
}