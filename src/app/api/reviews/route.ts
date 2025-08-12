import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { product: productId };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews,
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
    console.error('Get reviews error:', error);
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

    const { productId, orderId, rating, title, comment, images } = await req.json();

    if (!productId || !orderId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Product ID, order ID, rating, title, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      _id: orderId,
      user: user._id,
      status: 'delivered',
      'items.product': productId,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased and received' },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await Review.findOne({
      user: user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product for this order' },
        { status: 409 }
      );
    }

    // Create review
    const review = new Review({
      user: user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
    });

    await review.save();

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      const allReviews = await Review.find({ product: productId });
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      product.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
      product.reviewCount = allReviews.length;
      await product.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: populatedReview,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
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