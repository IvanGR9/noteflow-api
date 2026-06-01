import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { verifyAuth } from '@/lib/middleware';

const patchSchema = z.object({
  text: z.string().min(1).optional(),
  is_completed: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    verifyAuth(request);
    const { itemId } = await params;
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }
    const { text, is_completed } = result.data;
    const [item] = await sql`
      UPDATE checklist_items
      SET
        text = COALESCE(${text ?? null}, text),
        is_completed = COALESCE(${is_completed ?? null}, is_completed)
      WHERE id = ${itemId}
      RETURNING *
    `;
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error PATCH /api/checklist-items/[itemId]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    verifyAuth(request);
    const { itemId } = await params;
    await sql`DELETE FROM checklist_items WHERE id = ${itemId}`;
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error DELETE /api/checklist-items/[itemId]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
