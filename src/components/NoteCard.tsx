import { useState } from 'react';
import { MapPin, Trash2, Edit3, Check, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import TagBadge from '@/components/TagBadge';
import { formatDateTime, BLOG_TAGS } from '@/lib/routeUtils';
import type { Note, NoteTag } from '@/types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, tags: NoteTag[]) => void;
}

export default function NoteCard({ note, onDelete, onUpdate }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [editTags, setEditTags] = useState<NoteTag[]>(note.tags);

  const saveEdit = () => {
    if (!editText.trim()) return;
    onUpdate(note.id, editText.trim(), editTags);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditText(note.text);
    setEditTags(note.tags);
    setEditing(false);
  };

  const toggleTag = (tag: NoteTag) => {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 group hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
          {formatDateTime(note.createdAt)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={saveEdit}
                className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="text-sm resize-none rounded-xl"
            autoFocus
          />
          <div className="flex flex-wrap gap-1">
            {BLOG_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                  editTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-slate-800 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{note.text}</p>
      )}

      <div className="flex items-center flex-wrap gap-1.5 mt-3">
        {(editing ? editTags : note.tags).map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        {note.location && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3" />
            {note.location.label}
          </span>
        )}
      </div>
    </div>
  );
}
