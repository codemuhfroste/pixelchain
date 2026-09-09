import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Local dev: reference photos land in /public/uploads and the DB stores the
// path relative to /public (e.g. "uploads/abc123.jpg"), servable directly
// by Next's static file handling. Moving to Supabase later means swapping
// this file's two functions for calls to Supabase Storage — nothing that
// calls savePhoto()/getPhotoUrl() needs to change. See README.md "Moving
// to Supabase".

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function savePhoto(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `uploads/${filename}`;
}

export function getPhotoUrl(storedPath: string): string {
  return `/${storedPath}`;
}
