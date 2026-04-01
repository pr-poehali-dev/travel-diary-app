import { useState, useRef } from 'react';
import { Send, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TagBadge from '@/components/TagBadge';
import { BLOG_TAGS } from '@/lib/routeUtils';
import type { NoteTag } from '@/types';

interface NoteEditorProps {
  onSave: (text: string, tags: NoteTag[], location?: { lat: number; lng: number; label?: string }) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function NoteEditor({ onSave, placeholder, compact }: NoteEditorProps) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleTag = (tag: NoteTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t) return;
    const normalized = t.startsWith('#') ? t : `#${t}`;
    if (!tags.includes(normalized)) {
      setTags((prev) => [...prev, normalized]);
    }
    setCustomTag('');
    setShowTagInput(false);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 5000 }
    );
  };

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim(), tags, location ?? undefined);
    setText('');
    setTags([]);
    setLocation(null);
    setShowTagInput(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Записать впечатление... (Ctrl+Enter — сохранить)'}
        rows={compact ? 2 : 3}
        className="border-0 resize-none rounded-none focus-visible:ring-0 text-sm bg-transparent px-4 pt-3"
      />

      {/* Теги */}
      <div className="px-3 pb-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={() => toggleTag(tag)} />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {BLOG_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                tags.includes(tag)
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {tag}
            </button>
          ))}
          {!showTagInput ? (
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              + тег
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomTag();
                  if (e.key === 'Escape') setShowTagInput(false);
                }}
                placeholder="#тег"
                className="text-xs px-2 py-0.5 rounded-full border border-indigo-300 outline-none w-20 bg-indigo-50"
              />
              <button type="button" onClick={addCustomTag} className="text-xs text-indigo-600 hover:text-indigo-800">✓</button>
              <button type="button" onClick={() => setShowTagInput(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Панель действий */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Геолокация */}
          <button
            type="button"
            onClick={location ? () => setLocation(null) : getLocation}
            className={`flex items-center gap-1 text-xs rounded-lg px-2 py-1 transition-all ${
              location
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            {geoLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : location ? (
              <>
                <MapPin className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{location.label}</span>
                <X className="w-3 h-3 ml-0.5" />
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Геолокация
              </>
            )}
          </button>
        </div>
        <Button
          onClick={handleSave}
          disabled={!text.trim()}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1 text-xs"
        >
          <Send className="w-3 h-3" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
