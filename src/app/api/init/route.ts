import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import dbConnect from '@/lib/mongodb';

import Seat from '@/models/Seat';
import User from '@/models/User';
import Location from '@/models/Location';

export async function POST() {
  try {
    await dbConnect();

    // Initialize location
    let location = await Location.findOne();
    if (!location) {
      location = await Location.create({
        name: 'Main Location',
        address: 'Default Address',
        totalSeats: 46,
        isActive: true,
      });
    }

    // Initialize seats
    const existingSeats = await Seat.countDocuments();
    if (existingSeats === 0) {
      const seats = [];
      for (let i = 1; i <= 46; i++) {
        seats.push({ seatNumber: i, location: location._id, status: 'vacant' });
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
  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize database' }, { status: 500 });
  }
}