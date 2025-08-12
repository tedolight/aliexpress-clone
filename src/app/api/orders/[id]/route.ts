import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const order = await Order.findById(params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price sku',
      });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user can access this order
    if (user.role !== 'admin' && order.user._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await requireRole(['admin', 'vendor'])(req);

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const { status, trackingNumber, estimatedDelivery, notes } = await req.json();

    // Update allowed fields
    if (status) {
      order.status = status;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }
    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    const updatedOrder = await Order.findById(params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price sku',
      });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 