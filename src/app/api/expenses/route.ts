import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import dbConnect from '@/lib/mongodb';

import Expense from '@/models/Expense';
import Log from '@/models/Log';

export async function GET() {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== 'Manager' && session.user.role !== 'Admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const expenses = await Expense.find().sort({ date: -1 });

  return NextResponse.json(expenses);

}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== 'Manager' && session.user.role !== 'Admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();

    const { description, amount, category, paidTo, method, date } = await request.json();

    const expense = new Expense({ description, amount, category, paidTo, method, date });

    await expense.save();

    await Log.create({
      action: 'CREATE',
      entity: 'Expense',
      entityId: expense._id,
      details: `Created expense: ${description} for ₹${amount}`,
      performedBy: session.user.email,
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error in POST /api/expenses:', error);
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}