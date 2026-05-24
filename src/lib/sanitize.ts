/**
 * Sanitização básica de HTML para conteúdo gerado por usuário (TipTap → renderizado
 * via dangerouslySetInnerHTML). Não substitui DOMPurify, mas elimina os vetores
 * de XSS mais comuns (scripts, event handlers, javascript:, data:, srcdoc).
 *
 * Para máxima segurança em produção, considere adicionar `isomorphic-dompurify`.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  return html
    // Remove tags perigosas completamente
    .replace(/<\s*(script|iframe|object|embed|link|style|meta|base|form)[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|link|style|meta|base|form)[^>]*\/?>/gi, '')
    // Remove qualquer atributo on* (onclick, onerror, onload, etc.)
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // Remove URLs javascript: e data: em href/src
    .replace(/(href|src|xlink:href)\s*=\s*"\s*(javascript|data|vbscript):[^"]*"/gi, '$1="#"')
    .replace(/(href|src|xlink:href)\s*=\s*'\s*(javascript|data|vbscript):[^']*'/gi, "$1='#'")
    // Remove srcdoc em iframes residuais
    .replace(/\ssrcdoc\s*=\s*"[^"]*"/gi, '')
    .replace(/\ssrcdoc\s*=\s*'[^']*'/gi, '');
}

/**
 * Remove TODA tag HTML — usado para indexação/busca em texto puro.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
