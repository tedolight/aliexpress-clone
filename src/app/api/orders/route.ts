import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};
    
    // If user is not admin, only show their orders
    if (user.role !== 'admin') {
      query.user = user._id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'Shipping and billing addresses are required' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      let product;
      try {
        product = await Product.findById(item.product);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid product in cart' },
          { status: 400 }
        );
      }
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.product} not found or unavailable` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping and tax (simplified)
    const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: user._id,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    });

    // Force pre('validate') and pre('save') hooks; also ensure orderNumber fallback
    if (!order.orderNumber) {
      // Fallback client-side generation in case hook timing differs
      const date = new Date();
      const yy = date.getFullYear().toString().slice(-2);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      order.orderNumber = `ORD${yy}${mm}${dd}${Math.floor(Math.random()*9000+1000)}`;
    }
    await order.save();

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: user._id },
      { items: [], total: 0, itemCount: 0 }
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price',
      });

    return NextResponse.json({
      message: 'Order created successfully',
      order: populatedOrder,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Surface useful error message to client
    const message =
      error?.code === 11000
        ? 'Duplicate order number. Please retry.'
        : (error?.message || 'Internal server error');
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 