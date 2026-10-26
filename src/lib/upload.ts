import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_BYTES = 4 * 1024 * 1024; // 4 МБ

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Проверяем настоящее содержимое файла, а не только то, что он про себя заявляет
function looksLikeImage(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

// Возвращает ссылку на сохранённую картинку.
// На Vercel файлы кладутся в Vercel Blob, на вашем компьютере в папку public/uploads.
export async function saveImage(file: File): Promise<string> {
  const ext = EXT[file.type];
  if (!ext) throw new Error("Допустимы только файлы JPG, PNG или WebP");
  if (file.size > MAX_BYTES) throw new Error("Файл больше 4 МБ");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buffer, file.type)) {
    throw new Error("Файл не похож на изображение");
  }

  const name = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`parts/${name}`, buffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Не подключено хранилище Vercel Blob (нет BLOB_READ_WRITE_TOKEN)");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
