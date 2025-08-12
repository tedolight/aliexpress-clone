import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const { reason } = await req.json().catch(() => ({ reason: '' }));

    const order = await Order.findById(params.id).populate('items.product', 'stock name');
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only owner or admin can cancel
    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate status
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
    if (nonCancellableStatuses.includes(order.status)) {
      return NextResponse.json({ error: `Order cannot be cancelled in status: ${order.status}` }, { status: 400 });
    }

    // Restock items
    for (const item of order.items) {
      const product: any = item.product;
      if (product) {
        await Product.findByIdAndUpdate(product._id, { $inc: { stock: item.quantity } });
      }
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = user._id;
    order.cancelledReason = reason || 'Cancelled by user';
    await order.save();

    const updated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate({ path: 'items.product', select: 'name images price' });

    return NextResponse.json({ message: 'Order cancelled', order: updated });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


