import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { KanbanCard, KanbanColumn, KanbanContent } from '../types';

interface KanbanBoardProps {
  value: KanbanContent;
  onChange: (value: KanbanContent) => void;
  readOnly?: boolean;
}

const SortableCard = ({ card, columnId, onEdit, onDelete, readOnly }: { card: KanbanCard; columnId: string; onEdit: (patch: Partial<KanbanCard>) => void; onDelete: () => void; readOnly?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', columnId },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description ?? '');

  const commit = () => {
    onEdit({ title: title.trim() || 'Sem título', description: desc.trim() || undefined });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 p-3 shadow-sm"
    >
      {!readOnly && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-surface-400 hover:text-surface-600 cursor-grab active:cursor-grabbing"
            aria-label="Arrastar"
          >
            <GripVertical size={14} />
          </button>
          <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-600 cursor-pointer" aria-label="Excluir">
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {editing && !readOnly ? (
        <div className="space-y-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            className="w-full text-sm font-medium bg-transparent border-b border-primary-300 focus:outline-none text-surface-900 dark:text-surface-100"
          />
          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição..."
            className="w-full text-xs bg-transparent border border-surface-200 dark:border-surface-600 rounded p-1 resize-none text-surface-600 dark:text-surface-300"
          />
          <button onClick={commit} className="text-xs text-primary-600 hover:underline">Salvar</button>
        </div>
      ) : (
        <button
          onClick={() => !readOnly && setEditing(true)}
          disabled={readOnly}
          className="w-full text-left cursor-text disabled:cursor-default"
        >
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{card.title}</p>
          {card.description && (
            <p className="text-xs text-surface-500 dark:text-surface-300 mt-1 whitespace-pre-wrap">{card.description}</p>
          )}
        </button>
      )}
    </div>
  );
};

const KanbanColumnView = ({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
  readOnly,
}: {
  column: KanbanColumn;
  onAddCard: () => void;
  onEditCard: (cardId: string, patch: Partial<KanbanCard>) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameColumn: (title: string) => void;
  onDeleteColumn: () => void;
  readOnly?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-xl p-3 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3 group">
        {editingTitle && !readOnly ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { onRenameColumn(title.trim() || 'Coluna'); setEditingTitle(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onRenameColumn(title.trim() || 'Coluna'); setEditingTitle(false); } if (e.key === 'Escape') setEditingTitle(false); }}
            className="text-sm font-semibold bg-transparent border-b border-primary-300 focus:outline-none text-surface-900 dark:text-surface-100 flex-1"
          />
        ) : (
          <button onClick={() => !readOnly && setEditingTitle(true)} disabled={readOnly} className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 cursor-text disabled:cursor-default">
            {column.title}
            <span className="text-xs text-surface-400 font-normal">({column.cards.length})</span>
          </button>
        )}
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button {...attributes} {...listeners} className="p-1 text-surface-400 hover:text-surface-600 cursor-grab active:cursor-grabbing" aria-label="Arrastar coluna">
              <GripVertical size={14} />
            </button>
            <button onClick={onDeleteColumn} className="p-1 text-red-400 hover:text-red-600 cursor-pointer" aria-label="Excluir coluna">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 min-h-[40px]">
          {column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              columnId={column.id}
              onEdit={(patch) => onEditCard(card.id, patch)}
              onDelete={() => onDeleteCard(card.id)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </SortableContext>

      {!readOnly && (
        <button
          onClick={onAddCard}
          className="mt-3 flex items-center gap-2 text-sm text-surface-500 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer p-2 rounded hover:bg-surface-200/50 dark:hover:bg-surface-700/50"
        >
          <Plus size={14} />
          Novo card
        </button>
      )}
    </div>
  );
};

export const KanbanBoard = ({ value, onChange, readOnly = false }: KanbanBoardProps) => {
  const columns = value?.columns ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findColumnByCardId = (cardId: string) =>
    columns.find((col) => col.cards.some((c) => c.id === cardId));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Reordena colunas
    if (activeType === 'column' && overType === 'column' && active.id !== over.id) {
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);
      onChange({ columns: arrayMove(columns, oldIndex, newIndex) });
      return;
    }

    // Move cards
    if (activeType === 'card') {
      const activeColumn = findColumnByCardId(String(active.id));
      if (!activeColumn) return;

      let overColumnId: string | undefined;
      if (overType === 'card') {
        overColumnId = findColumnByCardId(String(over.id))?.id;
      } else if (overType === 'column') {
        overColumnId = String(over.id);
      }
      if (!overColumnId) return;

      // Mesma coluna: reordena
      if (activeColumn.id === overColumnId) {
        const cardIds = activeColumn.cards.map((c) => c.id);
        const oldIndex = cardIds.indexOf(String(active.id));
        const newIndex = overType === 'card' ? cardIds.indexOf(String(over.id)) : cardIds.length - 1;
        const newCards = arrayMove(activeColumn.cards, oldIndex, newIndex);
        onChange({
          columns: columns.map((c) => (c.id === activeColumn.id ? { ...c, cards: newCards } : c)),
        });
        return;
      }

      // Coluna diferente: move
      const card = activeColumn.cards.find((c) => c.id === active.id);
      if (!card) return;
      const overColumn = columns.find((c) => c.id === overColumnId);
      if (!overColumn) return;

      const insertIndex = overType === 'card'
        ? overColumn.cards.findIndex((c) => c.id === over.id)
        : overColumn.cards.length;

      onChange({
        columns: columns.map((c) => {
          if (c.id === activeColumn.id) {
            return { ...c, cards: c.cards.filter((x) => x.id !== card.id) };
          }
          if (c.id === overColumn.id) {
            const newCards = [...c.cards];
            newCards.splice(insertIndex < 0 ? newCards.length : insertIndex, 0, card);
            return { ...c, cards: newCards };
          }
          return c;
        }),
      });
    }
  };

  const addColumn = () => {
    onChange({
      columns: [...columns, { id: crypto.randomUUID(), title: 'Nova coluna', cards: [] }],
    });
  };

  const addCard = (columnId: string) => {
    onChange({
      columns: columns.map((c) =>
        c.id === columnId
          ? { ...c, cards: [...c.cards, { id: crypto.randomUUID(), title: 'Novo card' }] }
          : c,
      ),
    });
  };

  const editCard = (columnId: string, cardId: string, patch: Partial<KanbanCard>) => {
    onChange({
      columns: columns.map((c) =>
        c.id === columnId
          ? { ...c, cards: c.cards.map((k) => (k.id === cardId ? { ...k, ...patch } : k)) }
          : c,
      ),
    });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    onChange({
      columns: columns.map((c) =>
        c.id === columnId ? { ...c, cards: c.cards.filter((k) => k.id !== cardId) } : c,
      ),
    });
  };

  const renameColumn = (columnId: string, title: string) => {
    onChange({ columns: columns.map((c) => (c.id === columnId ? { ...c, title } : c)) });
  };

  const deleteColumn = (columnId: string) => {
    onChange({ columns: columns.filter((c) => c.id !== columnId) });
  };

  const activeCard = activeId ? columns.flatMap((c) => c.cards).find((c) => c.id === activeId) : null;

  return (
    <div className="overflow-x-auto pb-4">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-start gap-4 min-h-[400px]">
            {columns.map((column) => (
              <KanbanColumnView
                key={column.id}
                column={column}
                onAddCard={() => addCard(column.id)}
                onEditCard={(cardId, patch) => editCard(column.id, cardId, patch)}
                onDeleteCard={(cardId) => deleteCard(column.id, cardId)}
                onRenameColumn={(title) => renameColumn(column.id, title)}
                onDeleteColumn={() => deleteColumn(column.id)}
                readOnly={readOnly}
              />
            ))}
            {!readOnly && (
              <button
                onClick={addColumn}
                className="w-72 flex-shrink-0 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 text-surface-500 dark:text-surface-300 hover:border-primary-400 hover:text-primary-600 cursor-pointer"
              >
                <Plus size={16} />
                Nova coluna
              </button>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCard && (
            <div className="rounded-lg bg-white dark:bg-surface-700 border border-primary-300 p-3 shadow-lg w-64">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
