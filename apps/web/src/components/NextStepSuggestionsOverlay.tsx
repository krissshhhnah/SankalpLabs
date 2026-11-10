import React from 'react';
import { Camera } from '@whiteboard/canvas-engine';
import { BoardObject } from '@whiteboard/shared';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { predictNextSteps, createChainedNodeAndConnector, NextStepSuggestion } from '../utils/ai/nextStepSuggester';

interface NextStepSuggestionsOverlayProps {
  selectedObject: BoardObject | null;
  camera: Camera;
  boardId: string;
  existingCount: number;
  onAddObjects: (objs: BoardObject[]) => void;
  onSelectNewNode: (id: string) => void;
}

export const NextStepSuggestionsOverlay: React.FC<NextStepSuggestionsOverlayProps> = ({
  selectedObject,
  camera,
  boardId,
  existingCount,
  onAddObjects,
  onSelectNewNode,
}) => {
  if (!selectedObject) return null;

  // We only show next-step suggestions for shapes, stickies, and text
  const isEligible =
    selectedObject.type === 'sticky' ||
    selectedObject.type === 'rounded-rectangle' ||
    selectedObject.type === 'rectangle' ||
    selectedObject.type === 'diamond' ||
    selectedObject.type === 'text';

  if (!isEligible) return null;

  const suggestions = predictNextSteps(selectedObject);
  if (suggestions.length === 0) return null;

  // World coordinates of the right-center anchor of the selected object
  const rightAnchorWorld = {
    x: selectedObject.x + (selectedObject.width || 180),
    y: selectedObject.y + (selectedObject.height || 100) / 2,
  };

  const screenPos = camera.worldToScreen(rightAnchorWorld);

  const handleApplySuggestion = (sug: NextStepSuggestion) => {
    const { newNode, connector } = createChainedNodeAndConnector(
      selectedObject,
      sug,
      boardId,
      existingCount + 10
    );
    onAddObjects([newNode, connector]);
    onSelectNewNode(newNode.id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${screenPos.x + 18}px`,
        top: `${screenPos.y - 36}px`,
      }}
      className="z-40 pointer-events-auto flex flex-col gap-1.5 select-none animate-in fade-in slide-in-from-left-2 duration-150"
    >
      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100/90 text-purple-800 rounded-md text-[10px] font-bold w-fit shadow-2xs">
        <Sparkles className="w-2.5 h-2.5" />
        <span>Next Step Suggestions</span>
      </div>

      <div className="flex flex-col gap-1">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleApplySuggestion(sug)}
            className="group flex items-center gap-2 px-3 py-1.5 bg-white/95 hover:bg-purple-600 text-slate-700 hover:text-white border border-slate-200/90 hover:border-purple-600 rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600 group-hover:text-white transition" />
            <span>{sug.label}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white ml-auto opacity-0 group-hover:opacity-100 transition" />
          </button>
        ))}
      </div>
    </div>
  );
};

