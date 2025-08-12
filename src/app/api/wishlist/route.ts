import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'wishlist',
        select: 'name price images rating reviewCount',
      });

    return NextResponse.json({
      wishlist: populatedUser?.wishlist || [],
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return NextResponse.json(
        { error: 'Product is already in wishlist' },
        { status: 409 }
      );
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'wishlist',
        select: 'name price images rating reviewCount',
      });

    return NextResponse.json({
      message: 'Product added to wishlist successfully',
      wishlist: populatedUser?.wishlist || [],
    });
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
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

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (id: any) => id.toString() !== productId
    );
    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'wishlist',
        select: 'name price images rating reviewCount',
      });

    return NextResponse.json({
      message: 'Product removed from wishlist successfully',
      wishlist: populatedUser?.wishlist || [],
    });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
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