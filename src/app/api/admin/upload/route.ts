import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveImage } from "@/lib/upload";

// Загрузка фото: только для администратора
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не получен" }, { status: 400 });
    }
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Не удалось загрузить файл";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
