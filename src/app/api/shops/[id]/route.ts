import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { shops as localShops } from '@/lib/shops';

// GET single shop by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try MongoDB first
    try {
      const conn = await connectToDatabase();
      if (conn) {
        // Try to find by MongoDB ID or slug
        let shop = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          shop = await Shop.findById(id).lean();
        }
        if (!shop) {
          shop = await Shop.findOne({ slug: id }).lean();
        }
        if (shop) {
          return NextResponse.json({ success: true, shop });
        }
      }
    } catch (error) {
      console.warn('MongoDB not available');
    }

    // Fallback to local data
    const localShop = localShops.find(s => s.slug === id || s.id.toString() === id);
    if (localShop) {
      return NextResponse.json({ success: true, shop: localShop });
    }

    return NextResponse.json(
      { success: false, error: 'Shop not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}

// PUT update shop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Find and update
    let shop = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      shop = await Shop.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    }
    if (!shop) {
      shop = await Shop.findOneAndUpdate({ slug: id }, body, { new: true, runValidators: true });
    }

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, shop });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shop' },
      { status: 500 }
    );
  }
}

// DELETE shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;

    let shop = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      shop = await Shop.findByIdAndDelete(id);
    }
    if (!shop) {
      shop = await Shop.findOneAndDelete({ slug: id });
    }

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shop' },
      { status: 500 }
    );
  }
}
