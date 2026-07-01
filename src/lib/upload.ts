import { supabase } from './supabase';

const BUCKET = 'lesson-content';
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas arquivos de imagem são permitidos.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Imagem muito grande (máximo 8MB).');
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Falha ao enviar a imagem.');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
