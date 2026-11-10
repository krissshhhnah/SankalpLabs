import React, { useState, useMemo } from 'react';
import { X, Search, Command, Keyboard, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  name: string;
  keys: string[];
  description?: string;
  category: 'Tools' | 'Canvas & View' | 'Editing & Stickies' | 'Workflow & Save';
}

const SHORTCUTS: ShortcutItem[] = [
  // Tools
  { name: 'Select / Move Tool', keys: ['V'], category: 'Tools', description: 'Standard selection and transform tool' },
  { name: 'Hand / Pan Tool', keys: ['H'], category: 'Tools', description: 'Pan around the boundless canvas' },
  { name: 'Sticky Note Tool', keys: ['N'], category: 'Tools', description: 'Quick sticky note placement' },
  { name: 'Text Box Tool', keys: ['T'], category: 'Tools', description: 'Add formatted text anywhere' },
  { name: 'Rectangle Shape', keys: ['R'], category: 'Tools', description: 'Draw rectangular cards and shapes' },
  { name: 'Ellipse / Circle', keys: ['O'], category: 'Tools', description: 'Draw round nodes and circles' },
  { name: 'Line Tool', keys: ['L'], category: 'Tools', description: 'Draw straight and connecting lines' },
  { name: 'Arrow Tool', keys: ['A'], category: 'Tools', description: 'Draw directional flow arrows' },
  { name: 'Smart Connector', keys: ['C'], category: 'Tools', description: 'Connect objects with reactive lines' },
  { name: 'Freehand Pen / Marker', keys: ['P'], category: 'Tools', description: 'Draw freehand annotations & sketches' },
  { name: 'Slide Frame', keys: ['F'], category: 'Tools', description: 'Create presentation slide containers' },
  { name: 'Image Upload', keys: ['I'], category: 'Tools', description: 'Add graphics and screenshots' },
  { name: 'Comment Thread Pin', keys: ['M'], category: 'Tools', description: 'Drop collaborative feedback pin' },

  // Canvas & View
  { name: 'Pan Canvas', keys: ['Space', 'Drag'], category: 'Canvas & View', description: 'Hold Space and drag mouse to pan' },
  { name: 'Zoom In / Out', keys: ['Ctrl', 'Scroll'], category: 'Canvas & View', description: 'Pinch trackpad or mouse wheel' },
  { name: 'Toggle Dark / Light Theme', keys: ['Alt', 'T'], category: 'Canvas & View', description: 'Switch between Obsidian, Light, Sepia, Blueprint' },
  { name: 'Cycle Background Grid', keys: ['G'], category: 'Canvas & View', description: 'Cycle Dotted, Lines, Crosses, None' },
  { name: 'Fit to View / Overview', keys: ['Shift', '1'], category: 'Canvas & View', description: 'Zoom to fit all objects on canvas' },
  { name: 'Reset Zoom to 100%', keys: ['Ctrl', '0'], category: 'Canvas & View', description: 'Standard 1:1 pixel scale' },

  // Editing & Stickies
  { name: 'Quick Sticky at Cursor', keys: ['Double Click'], category: 'Editing & Stickies', description: 'Double click canvas in select mode' },
  { name: 'Clone Sticky Right', keys: ['Tab'], category: 'Editing & Stickies', description: 'Clone current sticky 24px to the right' },
  { name: 'Clone Sticky Below', keys: ['Shift', 'Enter'], category: 'Editing & Stickies', description: 'Clone current sticky 24px below' },
  { name: 'Finish Inline Editing', keys: ['Esc'], category: 'Editing & Stickies', description: 'Exit sticky/text editing mode' },
  { name: 'Multi-Select Objects', keys: ['Shift', 'Click'], category: 'Editing & Stickies', description: 'Or drag marquee box over objects' },
  { name: 'Select All Unlocked', keys: ['Ctrl', 'A'], category: 'Editing & Stickies', description: 'Select all unlocked canvas items' },
  { name: 'Duplicate Objects', keys: ['Ctrl', 'D'], category: 'Editing & Stickies', description: 'Or hold Alt while dragging objects' },
  { name: 'Delete Selection', keys: ['Delete'], category: 'Editing & Stickies', description: 'Or Backspace key' },

  // Workflow & Save
  { name: 'Sankalp AI Copilot', keys: ['Ctrl', 'K'], category: 'Workflow & Save', description: 'Open AI Assistant for diagrams, organization, summaries & tasks' },
  { name: 'Save to Cloud', keys: ['Ctrl', 'S'], category: 'Workflow & Save', description: 'Instant server database synchronization' },
  { name: 'Undo Last Action', keys: ['Ctrl', 'Z'], category: 'Workflow & Save', description: 'Revert collaborative canvas edits' },
  { name: 'Redo Action', keys: ['Ctrl', 'Shift', 'Z'], category: 'Workflow & Save', description: 'Or Ctrl + Y' },
  { name: 'Copy Objects', keys: ['Ctrl', 'C'], category: 'Workflow & Save', description: 'Copy to clipboard' },
  { name: 'Paste Objects', keys: ['Ctrl', 'V'], category: 'Workflow & Save', description: 'Paste from clipboard at cursor position' },
  { name: 'Keyboard Shortcuts Help', keys: ['?'], category: 'Workflow & Save', description: 'Or Ctrl + /' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Tools', 'Editing & Stickies', 'Canvas & View', 'Workflow & Save'];

  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keys.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Keyboard Shortcuts</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold text-[10px] rounded-full">
                  Cheatsheet
                </span>
              </div>
              <p className="text-xs text-slate-400">Press ? or Ctrl+/ anywhere on the canvas to open</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts (e.g. sticky, zoom, undo)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No shortcuts found matching "{searchQuery}"</p>
              <p className="text-xs mt-1">Try another search term or clear the filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredShortcuts.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 rounded-2xl flex items-center justify-between gap-3 transition group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 transition">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="text-[11px] text-slate-400 truncate group-hover:text-slate-500">
                        {item.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && <span className="text-[10px] text-slate-400 font-semibold">+</span>}
                        <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pro tip: Double-click empty canvas to create a sticky note instantly!</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">{filteredShortcuts.length} shortcuts</span>
        </div>
      </div>
    </div>
  );
};
