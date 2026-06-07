import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function verifyAuth(request: Request): Promise<{ uid: string; email: string }> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? '' };
  } catch {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
