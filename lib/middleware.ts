import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function verifyAuth(request: Request): { userId: string } {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    return { userId: payload.userId as string };
  } catch {
    throw NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
