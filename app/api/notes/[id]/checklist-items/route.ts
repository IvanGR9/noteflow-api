import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { verifyAuth } from '@/lib/middleware';

const itemSchema = z.object({
  text: z.string().min(1),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAuth(request);
    const { id } = await params;
    const items = await sql`
      SELECT * FROM checklist_items
      WHERE note_id = ${id}
      ORDER BY id
    `;
    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error GET /api/notes/[id]/checklist-items:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAuth(request);
    const { id } = await params;
    const body = await request.json();
    const result = itemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }
    const { text } = result.data;
    const [item] = await sql`
      INSERT INTO checklist_items (note_id, text)
      VALUES (${id}, ${text})
      RETURNING *
    `;
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error POST /api/notes/[id]/checklist-items:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
