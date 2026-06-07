import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { verifyAuth } from '@/lib/middleware';

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().startsWith('image/'),
});

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    await verifyAuth(request);

    const body = await request.json();
    const result = uploadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }

    const { fileName, fileType } = result.data;
    const bucket = process.env.AWS_S3_BUCKET!;
    const region = process.env.AWS_REGION!;
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Error POST /api/upload/presigned-url:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
