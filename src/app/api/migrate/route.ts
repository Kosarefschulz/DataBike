import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { shops as localShops } from '@/lib/shops';

// POST - Migrate local data to MongoDB
export async function POST(request: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Check if data already exists
    const existingCount = await Shop.countDocuments();
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: false,
        error: `Database already has ${existingCount} shops. Use ?force=true to overwrite.`,
        existingCount
      }, { status: 409 });
    }

    // If force, clear existing data
    if (force && existingCount > 0) {
      await Shop.deleteMany({});
    }

    // Prepare data for insertion - deduplicate by slug
    const seenSlugs = new Set<string>();
    const shopsToInsert = localShops
      .filter(shop => {
        if (seenSlugs.has(shop.slug)) {
          return false;
        }
        seenSlugs.add(shop.slug);
        return true;
      })
      .map(shop => ({
        name: shop.name,
        slug: shop.slug,
        typ: shop.typ,
        prioritaet: shop.prioritaet,
        adresse: shop.adresse,
        stadtteil: shop.stadtteil,
        plz: shop.plz || '',
        telefon: shop.telefon || '-',
        email: shop.email || '-',
        website: shop.website || '-',
        geschaeftsfuehrer: shop.geschaeftsfuehrer || '-',
        bewertung: shop.bewertung || 0,
        anzahlBewertungen: shop.anzahlBewertungen || 0,
        schwerpunkte: shop.schwerpunkte || [],
        marken: shop.marken || [],
        route: shop.route || 0,
        lat: shop.lat || 0,
        lng: shop.lng || 0,
        notizen: '',
        status: 'aktiv',
        isCustom: false,
        createdBy: 'migration',
      }));

    // Insert all shops
    const result = await Shop.insertMany(shopsToInsert, { ordered: false })

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${result.length} shops to MongoDB`,
      count: result.length
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}

// GET - Check migration status
export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: true,
        dbConnected: false,
        localCount: localShops.length,
        dbCount: 0,
        message: 'Database not configured - using local data only'
      });
    }

    const dbCount = await Shop.countDocuments();
    const customCount = await Shop.countDocuments({ isCustom: true });

    return NextResponse.json({
      success: true,
      dbConnected: true,
      localCount: localShops.length,
      dbCount,
      customCount,
      migrated: dbCount > 0
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
