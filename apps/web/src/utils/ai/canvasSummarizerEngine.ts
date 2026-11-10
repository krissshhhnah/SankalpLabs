import { BoardObject, FrameObject, TextObject, ShapeObject, StickyObject } from '@whiteboard/shared';

export interface CanvasSummaryResult {
  summaryText: string;
  actionItems: string[];
  themes: string[];
  generatedCardObjects: BoardObject[];
}

/**
 * Extracts and synthesizes all textual content on the board into a structured executive report
 */
export function summarizeCanvasContent(
  objects: BoardObject[],
  centerX: number,
  centerY: number,
  boardId: string,
  startZIndex: number = 200
): CanvasSummaryResult {
  const textSnippets: string[] = [];

  objects.forEach((obj) => {
    if (obj.type === 'sticky') {
      const s = (obj as StickyObject).text?.trim();
      if (s) textSnippets.push(s);
    } else if (obj.type === 'text') {
      const t = (obj as TextObject).text?.trim();
      if (t) textSnippets.push(t);
    } else if (obj.type === 'frame') {
      const f = (obj as FrameObject).title?.trim();
      if (f) textSnippets.push(`[Frame] ${f}`);
    }
  });

  const count = textSnippets.length;
  let summaryText = '';
  let themes: string[] = [];
  let actionItems: string[] = [];

  if (count === 0) {
    summaryText = 'The current canvas is clean with no textual artifacts or sticky notes placed yet.';
    themes = ['Empty Canvas', 'Ideation Ready'];
    actionItems = [
      'Add initial brainstorm sticky notes',
      'Use AI Assistant (Cmd+K) to generate a starter architecture or flowchart',
    ];
  } else {
    // Synthesize themes and action items based on collected text
    const combined = textSnippets.join(' ').toLowerCase();

    if (combined.includes('auth') || combined.includes('login') || combined.includes('security')) {
      themes.push('Authentication & Security', 'User Access Control');
      actionItems.push('Finalize JWT session expiration policies', 'Audit password hashing & rate limiting');
    }
    if (combined.includes('api') || combined.includes('cloud') || combined.includes('database') || combined.includes('server')) {
      themes.push('Cloud Architecture', 'Backend Infrastructure');
      actionItems.push('Configure Redis pub/sub room isolation', 'Run load tests on WebSocket connections');
    }
    if (combined.includes('ux') || combined.includes('design') || combined.includes('ui') || combined.includes('mobile')) {
      themes.push('Design System & UI/UX', 'Product Usability');
      actionItems.push('Review color contrast & accessibility', 'Test responsive viewport transitions on mobile');
    }
    if (combined.includes('sprint') || combined.includes('retro') || combined.includes('bug')) {
      themes.push('Agile Delivery', 'Continuous Quality');
      actionItems.push('Prioritize high-severity backlog tickets', 'Schedule mid-sprint architecture review');
    }

    if (themes.length === 0) {
      themes = ['Visual Brainstorming', 'Workflow Definition', 'Cross-Team Collaboration'];
    }
    if (actionItems.length === 0) {
      actionItems = [
        'Review clustered notes with project stakeholders',
        'Convert key decision blocks into tracked backlog tasks',
        'Export canvas summary report to team documentation'
      ];
    }

    summaryText = `Synthesized ${count} board elements across ${themes.length} major themes. The workspace focuses on ${themes.join(', ')} with ${actionItems.length} immediate follow-ups identified.`;
  }

  // Generate visual summary card on canvas
  let currentZ = startZIndex;
  const cardWidth = 380;
  const cardHeight = 320;
  const cardX = centerX - cardWidth / 2;
  const cardY = centerY - cardHeight / 2;

  const frameId = `ai-summary-frame-${Date.now()}`;
  const shapeId = `ai-summary-bg-${Date.now()}`;
  const textId = `ai-summary-txt-${Date.now()}`;

  const bgShape: ShapeObject = {
    id: shapeId,
    boardId,
    type: 'rounded-rectangle',
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    rotation: 0,
    zIndex: currentZ++,
    locked: false,
    fillColor: '#f8fafc',
    strokeColor: '#8b5cf6',
    strokeWidth: 2,
    opacity: 1,
    borderRadius: 16,
    fillStyle: 'solid',
    strokeStyle: 'solid',
    createdBy: 'ai-assistant',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const formattedContent = [
    `✨ EXECUTIVE CANVAS SUMMARY`,
    `─────────────────────────────────`,
    summaryText,
    '',
    `📌 KEY THEMES:`,
    ...themes.map((t) => `• ${t}`),
    '',
    `✅ ACTION ITEMS:`,
    ...actionItems.map((a) => `[ ] ${a}`),
  ].join('\n');

  const textObj: TextObject = {
    id: textId,
    boardId,
    type: 'text',
    x: cardX + 18,
    y: cardY + 16,
    width: cardWidth - 36,
    height: cardHeight - 32,
    rotation: 0,
    zIndex: currentZ++,
    locked: false,
    text: formattedContent,
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#0f172a',
    align: 'left',
    createdBy: 'ai-assistant',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    summaryText,
    actionItems,
    themes,
    generatedCardObjects: [bgShape, textObj],
  };
}

