import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import dbConnect from '@/lib/mongodb';

import Expense from '@/models/Expense';
import Log from '@/models/Log';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== 'Manager' && session.user.role !== 'Admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { id } = await params;

  const { description, amount, category, paidTo, method, date } = await request.json();

  const expense = await Expense.findByIdAndUpdate(id, { description, amount, category, paidTo, method, date }, { new: true });

  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  await Log.create({
    action: 'UPDATE',
    entity: 'Expense',
    entityId: id,
    details: `Updated expense: ${expense.description}`,
    performedBy: session.user.email,
  });

  return NextResponse.json(expense);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== 'Manager' && session.user.role !== 'Admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { id } = await params;

  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  await Log.create({
    action: 'DELETE',
    entity: 'Expense',
    entityId: id,
    details: `Deleted expense: ${expense.description} for ₹${expense.amount}`,
    performedBy: session.user.email,
  });

  return NextResponse.json({ message: 'Expense deleted' });
}