import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No se envio archivo' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ message: 'Archivo vacio' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const safeName = sanitizeFileName(file.name);
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const requestUrl = new URL(request.url);
    const publicUrl = `${requestUrl.origin}/uploads/${uniqueName}`;

    return NextResponse.json({
      message: 'Archivo subido correctamente',
      url: publicUrl,
      fileName: uniqueName,
    });
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    return NextResponse.json(
      { message: 'Error al subir archivo' },
      { status: 500 },
    );
  }
}
