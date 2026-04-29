import type { HelpArticle } from '../types';

export const mockHelpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Como acessar minhas aulas?',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Como acessar minhas aulas?' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Para acessar suas aulas, vá para a seção "Meus Cursos" no menu.' }]
        }
      ]
    }),
    category: 'Acesso',
    videoUrl: 'https://example.com/help1.mp4'
  }
];