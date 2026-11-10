import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  ArrowRight,
  GitFork,
  LayoutGrid,
  FileText,
  CheckSquare,
  Search,
  Zap,
  CornerDownLeft,
  Check,
  RefreshCw,
} from 'lucide-react';
import { BoardObject } from '@whiteboard/shared';
import { generateDiagramFromPrompt } from '../../utils/ai/diagramEngine';
import { organizeInGrid, organizeByColorOrCategory } from '../../utils/ai/autoOrganizeEngine';
import { summarizeCanvasContent } from '../../utils/ai/canvasSummarizerEngine';
import { convertObjectsToTasks } from '../../utils/ai/taskConversionEngine';

export type AIModalTab = 'generate' | 'diagram' | 'organize' | 'summarize' | 'tasks';

interface AICanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddObjects: (objs: BoardObject[]) => void;
  onUpdateObject: (id: string, update: Partial<BoardObject>) => void;
  boardId: string;
  camera: { x: number; y: number; zoom: number };
  objects: BoardObject[];
  selectedIds: string[];
  initialTab?: AIModalTab;
}

export const AICanvasModal: React.FC<AICanvasModalProps> = ({
  isOpen,
  onClose,
  onAddObjects,
  onUpdateObject,
  boardId,
  camera,
  objects,
  selectedIds,
  initialTab = 'generate',
}) => {
  const [activeTab, setActiveTab] = useState<AIModalTab>(initialTab);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<{
    title: string;
    description: string;
    objectsToInsert?: BoardObject[];
    itemsToUpdate?: Array<{ id: string; x: number; y: number }>;
  } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setPreviewResult(null);
      setSuccessToast(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const relevantObjects = selectedIds.length > 0
    ? objects.filter((o) => selectedIds.includes(o.id))
    : objects;

  const handleRunAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        if (activeTab === 'generate' || activeTab === 'diagram') {
          const effectivePrompt = prompt.trim() || 'Cloud Microservices Architecture';
          const res = generateDiagramFromPrompt(
            effectivePrompt,
            camera.x,
            camera.y,
            boardId,
            objects.length + 10
          );
          setPreviewResult({
            title: res.title,
            description: `Generated ${res.objects.length} elements (shapes, labels, and magnetic connectors)`,
            objectsToInsert: res.objects,
          });
        } else if (activeTab === 'organize') {
          const res = organizeInGrid(relevantObjects, 4);
          setPreviewResult({
            title: 'Tidy-Up Grid Layout',
            description: `Arranged ${res.updatedObjects.length} notes into an aligned 4-column grid.`,
            itemsToUpdate: res.updatedObjects,
          });
        } else if (activeTab === 'summarize') {
          const res = summarizeCanvasContent(relevantObjects, camera.x, camera.y, boardId, objects.length + 10);
          setPreviewResult({
            title: 'Executive Canvas Summary',
            description: res.summaryText,
            objectsToInsert: res.generatedCardObjects,
          });
        } else if (activeTab === 'tasks') {
          const taskCards = convertObjectsToTasks(relevantObjects, camera.x, camera.y, boardId, objects.length + 10);
          setPreviewResult({
            title: 'Diagram to Sprint Tasks',
            description: `Converted visual nodes into ${taskCards.length} prioritized sprint task cards.`,
            objectsToInsert: taskCards,
          });
        }
      } finally {
        setIsProcessing(false);
      }
    }, 250);
  };

  const handleApply = () => {
    if (!previewResult) return;

    if (previewResult.objectsToInsert && previewResult.objectsToInsert.length > 0) {
      onAddObjects(previewResult.objectsToInsert);
      setSuccessToast(`Placed ${previewResult.objectsToInsert.length} elements on canvas!`);
    }

    if (previewResult.itemsToUpdate && previewResult.itemsToUpdate.length > 0) {
      previewResult.itemsToUpdate.forEach((item) => {
        onUpdateObject(item.id, { x: item.x, y: item.y });
      });
      setSuccessToast(`Organized ${previewResult.itemsToUpdate.length} elements!`);
    }

    setTimeout(() => {
      onClose();
    }, 500);
  };

  const QUICK_PROMPTS = [
    'Cloud Microservices Architecture',
    'User Authentication & JWT Flow',
    'E-Commerce Payment & Order Pipeline',
    'Continuous Deployment (CI/CD) Pipeline',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Sankalp AI Intelligence</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-md">
                  Layer 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual copilot for diagrams, organization, summaries, and tasks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => {
              setActiveTab('generate');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Prompt</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('diagram');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'diagram'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Text-to-Diagram</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('organize');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'organize'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Auto-Organize ({relevantObjects.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('summarize');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'summarize'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Canvas Summary</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tasks');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>To Tasks</span>
          </button>
        </div>

        {/* Input / Command Body */}
        <div className="p-5 flex flex-col gap-4">
          {(activeTab === 'generate' || activeTab === 'diagram') && (
            <div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunAction();
                  }}
                  placeholder="Describe your diagram or workflow (e.g. User Signup -> Verify Email -> Welcome)..."
                  className="w-full pl-10 pr-24 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  onClick={handleRunAction}
                  disabled={isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Generate</span>
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp}
                    onClick={() => {
                      setPrompt(qp);
                      setTimeout(handleRunAction, 50);
                    }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 rounded-md text-xs transition cursor-pointer"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'organize' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white mb-1">
                Tidy Up & Grid Alignment
              </p>
              <p className="mb-3">
                Neatly align and distribute {relevantObjects.length} canvas elements into an evenly spaced multi-column grid with equal margins.
              </p>
              <button
                onClick={handleRunAction}
                disabled={isProcessing || relevantObjects.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LayoutGrid className="w-4 h-4" />}
                <span>Auto-Organize Selection</span>
              </button>
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white mb-1">
                Executive Canvas Summarization
              </p>
              <p className="mb-3">
                Synthesize all {objects.length} elements across the board into key themes, takeaways, and actionable bullet points.
              </p>
              <button
                onClick={handleRunAction}
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Generate Board Summary</span>
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white mb-1">
                Diagram-to-Task Conversion
              </p>
              <p className="mb-3">
                Converts process nodes and sticky notes into structured Kanban task cards with priority badges and assignees.
              </p>
              <button
                onClick={handleRunAction}
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                <span>Convert to Sprint Tasks</span>
              </button>
            </div>
          )}

          {/* Preview Panel */}
          {previewResult && (
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                    {previewResult.title}
                  </h4>
                  <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-0.5 whitespace-pre-line line-clamp-3">
                    {previewResult.description}
                  </p>
                </div>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Insert on Canvas</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-600 dark:text-slate-300 font-mono">Enter</kbd> to run</span>
            <span>&bull;</span>
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-600 dark:text-slate-300 font-mono">Esc</kbd> to close</span>
          </div>
          <span className="text-purple-600 dark:text-purple-400 font-medium">SankalpLabs Copilot Engine</span>
        </div>
      </div>
    </div>
  );
};

