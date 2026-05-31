import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const notes = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error GET /api/notes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }
    const { title, type, content, color } = result.data;
    const [note] = await sql`
      INSERT INTO notes (title, type, content, color)
      VALUES (${title}, ${type}, ${content}, ${color})
      RETURNING *
    `;
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/notes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}