import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';

import Subscription from '@/models/Subscription';

import Seat from '@/models/Seat';

import Payment from '@/models/Payment';

import WaitingList from '@/models/WaitingList';

function calculateEndDate(start: Date, duration: string) {

  const startDate = new Date(start);

  if (duration.includes('month')) {

    const months = parseInt(duration.split(' ')[0]);

    startDate.setMonth(startDate.getMonth() + months);

  } else {

    const days = parseInt(duration.split(' ')[0]) || 0;

    startDate.setDate(startDate.getDate() + days);

  }

  return startDate;

}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  await dbConnect();

  const { id } = await params;

  const { seatNumber } = await request.json();

  const subscription = await Subscription.findById(id);

  if (!subscription) {

    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

  }

  const oldSeat = await Seat.findById(subscription.seat);

  const newSeat = await Seat.findOne({ seatNumber });

  if (!newSeat || newSeat.status !== 'vacant') {

    return NextResponse.json({ error: 'Seat not available' }, { status: 400 });

  }

  // update seats

  if (oldSeat) {

    oldSeat.status = 'vacant';

    oldSeat.assignedMember = null;

    oldSeat.subscription = null;

    await oldSeat.save();

  }

  newSeat.status = 'occupied';

  newSeat.assignedMember = subscription.member;

  newSeat.subscription = subscription._id;

  await newSeat.save();

  subscription.seat = newSeat._id;

  await subscription.save();

  return NextResponse.json({ message: 'Seat changed successfully' });

}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  await dbConnect();

  const { id } = await params;

  const subscription = await Subscription.findById(id);

  if (!subscription) {

    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

  }

  subscription.status = 'expired';

  await subscription.save();

  // free seat

  const seat = await Seat.findById(subscription.seat);

  if (seat) {

    seat.status = 'vacant';

    seat.assignedMember = null;

    seat.subscription = null;

    await seat.save();

  }

  // assign to next in waiting list

  const nextWaiting = await WaitingList.findOne().sort({ requestedDate: 1 });

  if (nextWaiting) {

    // create subscription for this member

    const endDate = calculateEndDate(new Date(nextWaiting.startDate), nextWaiting.duration);

    const newSubscription = new Subscription({

      member: nextWaiting.member,

      seat: seat._id,

      startDate: new Date(nextWaiting.startDate),

      endDate,

      duration: nextWaiting.duration,

      totalAmount: nextWaiting.amount,

    });

    await newSubscription.save();

    // create payment

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });

    const counter = lastPayment && lastPayment.uniqueCode ? parseInt(lastPayment.uniqueCode.slice(-3)) + 1 : 1;

    const uniqueCode = `EVOLVE${year}${month}${String(counter).padStart(3, '0')}`;

    const payment = new Payment({

      subscription: newSubscription._id,

      amount: nextWaiting.amount,

      method: nextWaiting.paymentMethod,

      upiCode: nextWaiting.paymentMethod === 'UPI' ? nextWaiting.upiCode : undefined,

      dateTime: new Date(nextWaiting.dateTime),

      uniqueCode,

    });

    await payment.save();

    newSubscription.payments.push(payment._id);

    await newSubscription.save();

    // assign the seat to this member

    seat.status = 'occupied';

    seat.assignedMember = nextWaiting.member;

    seat.subscription = newSubscription._id;

    await seat.save();

    // remove from waiting

    await WaitingList.findByIdAndDelete(nextWaiting._id);

  }

  return NextResponse.json({ message: 'Subscription ended' });

}