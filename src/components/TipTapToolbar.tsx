import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Link, Image as ImageIcon,
  Table, AlignLeft, AlignCenter, AlignRight, Highlighter,
  Undo, Redo, Underline, Subscript, Superscript, Video, Code2
} from 'lucide-react';

interface TipTapToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

const ToolbarButton = ({ onClick, isActive, children, title }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`
      p-2 rounded-lg transition-colors
      ${isActive 
        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
      }
    `}
  >
    {children}
  </button>
);

const Separator = () => (
  <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />
);

export const TipTapToolbar = ({ editor }: TipTapToolbarProps) => {
  if (!editor) return null;

  const addVideo = () => {
    const url = window.prompt('Digite a URL do YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const addImage = () => {
    const url = window.prompt('Digite a URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Digite a URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addHtml = () => {
    const html = window.prompt('Digite o código HTML:');
    if (html) {
      editor.commands.insertContent(html);
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)">
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)">
        <Redo size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        isActive={editor.isActive('heading', { level: 1 })}
        title="Título 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        isActive={editor.isActive('heading', { level: 2 })}
        title="Título 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
        isActive={editor.isActive('heading', { level: 3 })}
        title="Título 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        isActive={editor.isActive('bold')}
        title="Negrito (Ctrl+B)"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        isActive={editor.isActive('italic')}
        title="Itálico (Ctrl+I)"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        isActive={editor.isActive('underline')}
        title="Sublinhado (Ctrl+U)"
      >
        <Underline size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleStrike().run()} 
        isActive={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleCode().run()} 
        isActive={editor.isActive('code')}
        title="Código inline"
      >
        <Code size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHighlight().run()} 
        isActive={editor.isActive('highlight')}
        title="Destacar texto"
      >
        <Highlighter size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleSubscript().run()} 
        isActive={editor.isActive('subscript')}
        title="Subscrito"
      >
        <Subscript size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleSuperscript().run()} 
        isActive={editor.isActive('superscript')}
        title="Sobrescrito"
      >
        <Superscript size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        isActive={editor.isActive('bulletList')}
        title="Lista não ordenada"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        isActive={editor.isActive('orderedList')}
        title="Lista ordenada"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleTaskList().run()} 
        isActive={editor.isActive('taskList')}
        title="Lista de tarefas"
      >
        <CheckSquare size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        isActive={editor.isActive('blockquote')}
        title="Citação"
      >
        <Quote size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().setHorizontalRule().run()} 
        title="Linha horizontal"
      >
        <Minus size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
        isActive={editor.isActive('codeBlock')}
        title="Bloco de código"
      >
        <Code size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={addLink} 
        isActive={editor.isActive('link')}
        title="Inserir link"
      >
        <Link size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={addImage} 
        title="Inserir imagem"
      >
        <ImageIcon size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={addVideo} 
        title="Inserir vídeo do YouTube"
      >
        <Video size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={addTable} 
        title="Inserir tabela"
      >
        <Table size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={addHtml} 
        title="Inserir código HTML"
      >
        <Code2 size={18} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton 
        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Alinhar à esquerda"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Centralizar"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Alinhar à direita"
      >
        <AlignRight size={18} />
      </ToolbarButton>
    </div>
  );
};