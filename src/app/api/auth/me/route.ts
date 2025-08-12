import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        addresses: user.addresses,
        wishlist: user.wishlist,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
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

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    const { name, avatar, addresses } = await req.json();

    // Update allowed fields
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (addresses) user.addresses = addresses;

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        addresses: user.addresses,
        wishlist: user.wishlist,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
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