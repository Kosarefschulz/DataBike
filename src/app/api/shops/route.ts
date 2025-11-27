import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { shops as localShops } from '@/lib/shops';

// GET all shops
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all'; // 'db', 'local', 'all'

    let dbShops: any[] = [];
    let combinedShops: any[] = [];

    // Try to get shops from MongoDB
    try {
      const conn = await connectToDatabase();
      if (conn) {
        dbShops = await Shop.find({}).lean();
      }
    } catch (error) {
      console.warn('MongoDB not available, using local data only');
    }

    // Combine based on source parameter
    if (source === 'db') {
      combinedShops = dbShops;
    } else if (source === 'local') {
      combinedShops = localShops;
    } else {
      // Combine: DB shops take priority (by slug), then local shops
      const dbSlugs = new Set(dbShops.map(s => s.slug));
      const localOnly = localShops.filter(s => !dbSlugs.has(s.slug));
      combinedShops = [...dbShops, ...localOnly];
    }

    return NextResponse.json({
      success: true,
      count: combinedShops.length,
      shops: combinedShops
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}

// POST new shop
export async function POST(request: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.adresse || !body.stadtteil) {
      return NextResponse.json(
        { success: false, error: 'Name, Adresse und Stadtteil sind erforderlich' },
        { status: 400 }
      );
    }

    // Create new shop
    const newShop = new Shop({
      ...body,
      isCustom: true,
      createdBy: body.createdBy || 'user',
    });

    await newShop.save();

    return NextResponse.json({
      success: true,
      shop: newShop
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shop:', error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Ein Laden mit diesem Namen existiert bereits' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create shop' },
      { status: 500 }
    );
  }
}
