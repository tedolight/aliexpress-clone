import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const parent = searchParams.get('parent');
    const level = searchParams.get('level');

    // Build query
    const query: any = { isActive: true };

    if (parent) {
      query.parent = parent;
    } else if (level) {
      query.level = parseInt(level);
    } else {
      // Default: get top-level categories
      query.parent = { $exists: false };
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await requireRole(['admin'])(req);

    const { name, slug, description, image, parent, order } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    // Calculate level
    let level = 0;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        );
      }
      level = parentCategory.level + 1;
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      parent,
      order: order || 0,
      level,
    });

    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('parent', 'name slug');

    return NextResponse.json({
      message: 'Category created successfully',
      category: populatedCategory,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
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