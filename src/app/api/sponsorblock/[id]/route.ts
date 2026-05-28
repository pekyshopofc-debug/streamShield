import { NextRequest, NextResponse } from 'next/server';
import { getSegments } from '@/lib/sponsorblock/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const segments = await getSegments(id);
    return NextResponse.json({ segments }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  } catch (err: any) {
    console.error('[/api/sponsorblock]', err?.message);
    return NextResponse.json({ segments: [] });
  }
}
