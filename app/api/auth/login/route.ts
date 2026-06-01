import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }

    const { email, password } = result.data;

    const [user] = await sql`SELECT id, password_hash FROM users WHERE email = ${email}`;
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = generateToken(user.id);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error POST /api/auth/login:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
