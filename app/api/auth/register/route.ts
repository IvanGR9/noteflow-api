import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }

    const { email, password } = result.data;

    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${password_hash})
      RETURNING id, email, created_at
    `;

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/auth/register:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
