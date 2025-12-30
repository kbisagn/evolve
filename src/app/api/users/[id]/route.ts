import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import dbConnect from '@/lib/mongodb';

import User from '@/models/User';
import bcrypt from 'bcryptjs';
import Log from '@/models/Log';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { id } = await params;
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { id } = await params;
  const body = await request.json();

  // Check if user is updating their own profile
  if (session.user.id === id) {
    const { name, email, password, currentPassword } = body;
    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name) updateData.name = name;

    if (email) {
      if (session.user.role !== 'Admin') {
        return NextResponse.json({ error: 'Only admin can change email' }, { status: 403 });
      }
      updateData.email = email;
    }

    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Log.create({
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      details: `User ${session.user.email} updated their own profile.`,
      performedBy: session.user.email,
    });

    return NextResponse.json(user);
  }

  // Admin updating role or password
  if (session.user.role === 'Admin') {
    const { role, password } = body;

    const updateData: { role?: string; password?: string } = {};

    if (role) {
      if (!['Admin', 'Manager', 'Member'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Log.create({
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      details: `Admin ${session.user.email} updated ${role ? `role to ${role}` : ''}${password ? ' password' : ''} for user ${user.email}.`,
      performedBy: session.user.email,
    });

    return NextResponse.json(user);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { id } = await params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await Log.create({
    action: 'DELETE',
    entity: 'User',
    entityId: id,
    details: `Deleted user: ${user.name} (${user.email})`,
    performedBy: session.user.email,
  });

  return NextResponse.json({ message: 'User deleted' });
}