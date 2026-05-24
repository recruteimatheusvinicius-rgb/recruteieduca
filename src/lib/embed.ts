/**
 * Converte uma URL ou trecho de iframe em um embed src padronizado.
 * Suporta YouTube (watch / youtu.be / shorts), Vimeo, e URLs diretas (mp4/embed).
 *
 * Retorna `{ src, kind }`. `kind` ajuda o componente a decidir entre <iframe> e <video>.
 */
export type EmbedKind = 'youtube' | 'vimeo' | 'iframe' | 'video' | 'unknown';

export interface EmbedInfo {
  src: string;
  kind: EmbedKind;
}

export function parseEmbed(input: string | null | undefined): EmbedInfo | null {
  if (!input || !input.trim()) return null;
  let value = input.trim();

  // Se o admin colou um <iframe ...>, extrai o src
  const iframeSrcMatch = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrcMatch) value = iframeSrcMatch[1];

  // YouTube — watch, embed, youtu.be, shorts
  const ytMatch = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (ytMatch) {
    return { src: `https://www.youtube.com/embed/${ytMatch[1]}`, kind: 'youtube' };
  }

  // Vimeo
  const vimeoMatch = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { src: `https://player.vimeo.com/video/${vimeoMatch[1]}`, kind: 'vimeo' };
  }

  // MP4 / WebM direto
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
    return { src: value, kind: 'video' };
  }

  // URL genérica → iframe simples (se for http(s))
  if (/^https?:\/\//i.test(value)) {
    return { src: value, kind: 'iframe' };
  }

  return { src: value, kind: 'unknown' };
}
