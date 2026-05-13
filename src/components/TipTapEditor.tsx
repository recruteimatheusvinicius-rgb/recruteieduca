import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Youtube } from '@tiptap/extension-youtube';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import { TipTapToolbar } from './TipTapToolbar';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  showToolbar?: boolean;
}

export const TipTapEditor = ({ content, onChange, editable = true, showToolbar = true }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      Typography,
      Placeholder.configure({
        placeholder: 'Digite seu conteúdo aqui...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Youtube.configure({
        controls: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="tiptap-editor-container border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      {showToolbar && <TipTapToolbar editor={editor} />}
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none 
          [&_.ProseMirror]:min-h-[200px]
          [&_.ProseMirror]:p-4
          [&_.ProseMirror]:bg-white
          [&_.ProseMirror]:dark:bg-surface-800
          [&_.ProseMirror]:focus:outline-none
          [&_.ProseMirror]:focus:ring-2
          [&_.ProseMirror]:focus:ring-primary-500/20
          [&_h1]:text-3xl
          [&_h1]:font-bold
          [&_h1]:mb-4
          [&_h2]:text-2xl
          [&_h2]:font-semibold
          [&_h2]:mb-3
          [&_h3]:text-xl
          [&_h3]:font-medium
          [&_h3]:mb-2
          [&_p]:mb-2
          [&_ul]:list-disc
          [&_ul]:pl-6
          [&_ol]:list-decimal
          [&_ol]:pl-6
          [&_li]:mb-1
          [&_a]:text-primary-600
          [&_a]:underline
          [&_code]:bg-surface-100
          [&_code]:dark:bg-surface-700
          [&_code]:px-1.5
          [&_code]:py-0.5
          [&_code]:rounded
          [&_code]:font-mono
          [&_code]:text-sm
          [&_pre]:bg-surface-900
          [&_pre]:text-surface-100
          [&_pre]:p-4
          [&_pre]:rounded-lg
          [&_pre]:overflow-x-auto
          [&_pre]:my-4
          [&_blockquote]:border-l-4
          [&_blockquote]:border-primary-500
          [&_blockquote]:pl-4
          [&_blockquote]:italic
          [&_blockquote]:text-surface-600
          [&_blockquote]:dark:text-surface-300
          [&_blockquote]:my-4
          [&_hr]:border-surface-200
          [&_hr]:dark:border-surface-700
          [&_hr]:my-6
          [&_table]:border-collapse
          [&_table]:w-full
          [&_table]:my-4
          [&_th]:border
          [&_th]:border-surface-200
          [&_th]:dark:border-surface-700
          [&_th]:bg-surface-50
          [&_th]:dark:bg-surface-700
          [&_th]:p-2
          [&_th]:text-left
          [&_td]:border
          [&_td]:border-surface-200
          [&_td]:dark:border-surface-700
          [&_td]:p-2
          [&_.is-editor-empty]:before:text-surface-400
          [&_.is-editor-empty]:before:dark:text-surface-400
          [&_.is-editor-empty]:before:content-[attr(data-placeholder)]
          [&_.is-editor-empty]:before:float-left
          [&_.is-editor-empty]:before:h-0
          [&_.is-editor-empty]:before:pointer-events-none
          [&_img]:max-w-full
          [&_img]:h-auto
          [&_img]:rounded-lg
          [&_img]:my-4
          [&_iframe]:rounded-lg
          [&_iframe]:my-4
          [&_ul[data-type=taskList]]:list-none
          [&_ul[data-type=taskList]]:pl-0
          [&_ul[data-type=taskList]_li]:flex
          [&_ul[data-type=taskList]_li]:items-center
          [&_ul[data-type=taskList]_li]:gap-2
          [&_ul[data-type=taskList]_li>label]:flex
          [&_ul[data-type=taskList]_li>label]:items-center
          [&_ul[data-type=taskList]_li>label]:gap-2
          [&_ul[data-type=taskList]_li>div]:flex-1
          [&_.highlight]:bg-yellow-200
          [&_.highlight]:dark:bg-yellow-900/30
          [&_.highlight]:rounded
          [&_.highlight]:px-1
        " 
      />
    </div>
  );
};