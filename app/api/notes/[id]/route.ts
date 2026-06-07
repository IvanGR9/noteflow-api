import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { verifyAuth } from '@/lib/middleware';

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const [note] = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!note) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error GET /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }
    const { title, content, color } = result.data;
    const [note] = await sql`
      UPDATE notes 
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        color = COALESCE(${color}, color),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!note) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error PATCH /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    await sql`DELETE FROM notes WHERE id = ${id}`;
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error DELETE /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}