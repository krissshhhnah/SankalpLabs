import { BoardObject, ShapeObject, StickyObject, TextObject, ConnectorObject, LineObject } from '@whiteboard/shared';
import { generateDiagramFromPrompt } from './diagramEngine';
import { generateSequenceDiagram, generateMindMap } from './advancedDiagramEngine';
import { organizeInGrid } from './autoOrganizeEngine';
import { summarizeCanvasContent } from './canvasSummarizerEngine';
import { convertObjectsToTasks } from './taskConversionEngine';

export interface AgentExecutionContext {
  boardId: string;
  camera: { x: number; y: number; zoom: number };
  objects: BoardObject[];
  selectedIds: string[];
  onAddObject?: (obj: BoardObject) => void;
  onAddObjects?: (objs: BoardObject[]) => void;
  onUpdateObject?: (id: string, update: Partial<BoardObject>) => void;
  onDeleteObjects?: (ids: string[]) => void;
}

export interface AgentExecutionResult {
  reply: string;
  actionTaken?: string;
  createdObjects?: BoardObject[];
}

const COLOR_MAP: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  red: { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b', bg: '#fee2e2' },
  blue: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af', bg: '#dbeafe' },
  green: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534', bg: '#dcfce7' },
  yellow: { fill: '#fef9c3', stroke: '#eab308', text: '#854d0e', bg: '#fef9c3' },
  purple: { fill: '#f3e8ff', stroke: '#a855f7', text: '#6b21a8', bg: '#f3e8ff' },
  pink: { fill: '#fce7f3', stroke: '#ec4899', text: '#9d174d', bg: '#fce7f3' },
  orange: { fill: '#ffedd5', stroke: '#f97316', text: '#9a3412', bg: '#ffedd5' },
  cyan: { fill: '#cffafe', stroke: '#06b6d4', text: '#155e75', bg: '#cffafe' },
  gray: { fill: '#f1f5f9', stroke: '#64748b', text: '#334155', bg: '#f1f5f9' },
  black: { fill: '#0f172a', stroke: '#020617', text: '#ffffff', bg: '#0f172a' },
  white: { fill: '#ffffff', stroke: '#cbd5e1', text: '#0f172a', bg: '#ffffff' },
};

function extractColor(text: string): { fill: string; stroke: string; text: string; bg: string } {
  const lower = text.toLowerCase();
  for (const [name, colors] of Object.entries(COLOR_MAP)) {
    if (lower.includes(name)) return colors;
  }
  // Default brand colors
  return { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a', bg: '#fef9c3' };
}

/**
 * Intelligent Canvas Agent Execution Engine
 * Parses natural language instructions, detects intent, and executes real canvas operations directly.
 */
export async function executeAgentCommand(
  prompt: string,
  ctx: AgentExecutionContext
): Promise<AgentExecutionResult> {
  const p = prompt.trim();
  const lower = p.toLowerCase();
  const colors = extractColor(p);
  const centerX = Math.round(ctx.camera.x);
  const centerY = Math.round(ctx.camera.y);
  const z = ctx.objects.length + 10;

  // ─────────────────────────────────────────────────────────────
  // 1. CIRCLE / ELLIPSE CREATION
  // ─────────────────────────────────────────────────────────────
  if (
    lower.includes('circle') ||
    lower.includes('round shape') ||
    lower.includes('ellipse') ||
    lower.includes('oval')
  ) {
    const size = lower.includes('big') || lower.includes('large') ? 220 : lower.includes('small') ? 90 : 150;
    const circle: ShapeObject = {
      id: `ai-circle-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'ellipse',
      x: centerX - size / 2,
      y: centerY - size / 2,
      width: size,
      height: size,
      rotation: 0,
      zIndex: z,
      locked: false,
      fillColor: colors.fill,
      strokeColor: colors.stroke,
      strokeWidth: 2,
      opacity: 1,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(circle);
    const colorName = Object.keys(COLOR_MAP).find((k) => lower.includes(k)) || 'blue';
    return {
      reply: `⚪ Created a ${colorName} circle at the center of your screen.`,
      actionTaken: 'create_circle',
      createdObjects: [circle],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RECTANGLE / SQUARE CREATION
  // ─────────────────────────────────────────────────────────────
  if (
    lower.includes('rectangle') ||
    lower.includes('square') ||
    lower.includes('box') ||
    lower.includes('card')
  ) {
    const isSquare = lower.includes('square');
    const width = isSquare ? 160 : 220;
    const height = isSquare ? 160 : 140;

    const rect: ShapeObject = {
      id: `ai-rect-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'rounded-rectangle',
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
      rotation: 0,
      zIndex: z,
      locked: false,
      fillColor: colors.fill,
      strokeColor: colors.stroke,
      strokeWidth: 2,
      opacity: 1,
      borderRadius: 14,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(rect);
    return {
      reply: `Created a ${isSquare ? 'square' : 'rounded rectangle'} on your whiteboard.`,
      actionTaken: 'create_rectangle',
      createdObjects: [rect],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. DIAMOND / DECISION SHAPE
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('diamond') || lower.includes('decision')) {
    const size = 150;
    const diamond: ShapeObject = {
      id: `ai-diamond-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'diamond',
      x: centerX - size / 2,
      y: centerY - size / 2,
      width: size,
      height: size,
      rotation: 0,
      zIndex: z,
      locked: false,
      fillColor: colors.fill,
      strokeColor: colors.stroke,
      strokeWidth: 2,
      opacity: 1,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(diamond);
    return {
      reply: `Created a decision diamond shape on your whiteboard.`,
      actionTaken: 'create_diamond',
      createdObjects: [diamond],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. TRIANGLE / STAR / HEXAGON
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('triangle') || lower.includes('star') || lower.includes('hexagon')) {
    const shapeType = lower.includes('star') ? 'star' : lower.includes('triangle') ? 'triangle' : 'hexagon';
    const size = 150;
    const shape: ShapeObject = {
      id: `ai-${shapeType}-${Date.now()}`,
      boardId: ctx.boardId,
      type: shapeType,
      x: centerX - size / 2,
      y: centerY - size / 2,
      width: size,
      height: size,
      rotation: 0,
      zIndex: z,
      locked: false,
      fillColor: colors.fill,
      strokeColor: colors.stroke,
      strokeWidth: 2,
      opacity: 1,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(shape);
    return {
      reply: `Added a ${shapeType} to your whiteboard.`,
      actionTaken: `create_${shapeType}`,
      createdObjects: [shape],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ARROW / CONNECTOR CREATION
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('arrow') || lower.includes('pointer')) {
    const arrow: LineObject = {
      id: `ai-arrow-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'arrow',
      x: centerX - 100,
      y: centerY,
      width: 200,
      height: 0,
      rotation: 0,
      zIndex: z,
      locked: false,
      strokeColor: colors.stroke || '#64748b',
      strokeWidth: 3,
      endArrow: true,
      endArrowStyle: 'triangle',
      style: 'straight',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(arrow);
    return {
      reply: `Added a directional arrow pointing across your canvas.`,
      actionTaken: 'create_arrow',
      createdObjects: [arrow],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. STICKY NOTE CREATION (Explicit or specific note content)
  // ─────────────────────────────────────────────────────────────
  if (
    lower.includes('sticky') ||
    lower.includes('note') ||
    lower.includes('post it') ||
    lower.includes('post-it')
  ) {
    // Extract intended text inside quotes or after keywords
    let noteText = 'New idea note';
    const quoteMatch = p.match(/["'“]([^"'”]+)["'”]/);
    if (quoteMatch) {
      noteText = quoteMatch[1];
    } else {
      const match = p.match(/(?:saying|with|named|for|about|that says)\s+(.+)$/i);
      if (match) noteText = match[1].trim();
      else noteText = p.replace(/(?:add|create|make|drop|put)\s+(?:a|an)?\s*(?:[a-z]+\s+)?(?:sticky|note|post it)\s*/i, '').trim() || 'New idea note';
    }

    const sticky: StickyObject = {
      id: `ai-sticky-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'sticky',
      x: centerX - 90,
      y: centerY - 70,
      width: 180,
      height: 140,
      rotation: 0,
      zIndex: z,
      locked: false,
      color: colors.bg || '#fef08a',
      text: noteText,
      fontSize: 13,
      textAlign: 'left',
      textColor: '#0f172a',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(sticky);
    return {
      reply: `📌 Placed a sticky note with: "${noteText}"`,
      actionTaken: 'create_sticky',
      createdObjects: [sticky],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. TEXT OBJECT CREATION
  // ─────────────────────────────────────────────────────────────
  if (lower.startsWith('text') || lower.includes('add text') || lower.includes('write text') || lower.includes('heading')) {
    let content = 'Heading';
    const quoteMatch = p.match(/["'“]([^"'”]+)["'”]/);
    if (quoteMatch) {
      content = quoteMatch[1];
    } else {
      content = p.replace(/(?:add|write|create|put)\s+text\s*(?:saying|about|:)?\s*/i, '').trim() || 'New Heading';
    }

    const textObj: TextObject = {
      id: `ai-text-${Date.now()}`,
      boardId: ctx.boardId,
      type: 'text',
      x: centerX - 120,
      y: centerY - 24,
      width: 240,
      height: 48,
      rotation: 0,
      zIndex: z,
      locked: false,
      text: content,
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#0f172a',
      align: 'left',
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (ctx.onAddObject) ctx.onAddObject(textObj);
    return {
      reply: `Added text "${content}" to your whiteboard.`,
      actionTaken: 'create_text',
      createdObjects: [textObj],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. AUTO-ORGANIZE / TIDY UP
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('organize') || lower.includes('tidy') || lower.includes('align') || lower.includes('clean up')) {
    const targets = ctx.selectedIds.length > 0
      ? ctx.objects.filter((o) => ctx.selectedIds.includes(o.id))
      : ctx.objects.filter((o) => o.type === 'sticky' || o.type === 'rounded-rectangle');

    if (targets.length === 0) {
      return {
        reply: 'There are no notes or shapes on the whiteboard to organize yet. Add a few stickies and ask me again!',
      };
    }

    const res = organizeInGrid(targets, 4);
    if (ctx.onUpdateObject) {
      res.updatedObjects.forEach((it) => {
        ctx.onUpdateObject!(it.id, { x: it.x, y: it.y });
      });
    }

    return {
      reply: `✨ Auto-organized ${res.updatedObjects.length} canvas elements into an aligned 4-column grid.`,
      actionTaken: 'organize_grid',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. SUMMARIZE BOARD
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('takeaway')) {
    const res = summarizeCanvasContent(ctx.objects, centerX, centerY, ctx.boardId, z);
    if (ctx.onAddObjects) {
      ctx.onAddObjects(res.generatedCardObjects);
    }
    return {
      reply: `📝 Board Summary Generated:\n\n${res.summaryText}\n\n• Key Themes: ${res.themes.join(', ')}\n• Action items: ${res.actionItems.length}\n\nI have placed an Executive Summary Card on your canvas!`,
      actionTaken: 'summarize_board',
      createdObjects: res.generatedCardObjects,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. CONVERT TO TASKS
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('task') || lower.includes('backlog') || lower.includes('jira') || lower.includes('linear') || lower.includes('action item')) {
    const taskCards = convertObjectsToTasks(ctx.objects, centerX, centerY, ctx.boardId, z);
    if (ctx.onAddObjects) {
      ctx.onAddObjects(taskCards);
    }
    return {
      reply: `📋 Converted your visual canvas nodes into ${taskCards.length} prioritized sprint task cards with status badges and placed them on the board.`,
      actionTaken: 'convert_to_tasks',
      createdObjects: taskCards,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10.5. SEQUENCE DIAGRAM
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('sequence')) {
    const res = generateSequenceDiagram(
      'Client - Server - DB Sequence Flow',
      ['Browser Client', 'Fastify Gateway', 'Auth Service', 'PostgreSQL'],
      [
        { from: 0, to: 1, label: 'POST /api/login' },
        { from: 1, to: 2, label: 'Verify User Token' },
        { from: 2, to: 3, label: 'SELECT * FROM users' },
        { from: 3, to: 2, label: 'User Record Data', isResponse: true },
        { from: 2, to: 1, label: 'JWT Signed Token', isResponse: true },
        { from: 1, to: 0, label: '200 OK (Auth Success)', isResponse: true },
      ],
      centerX,
      centerY,
      ctx.boardId,
      z
    );

    if (ctx.onAddObjects) ctx.onAddObjects(res.objects);
    return {
      reply: `⚡ Generated Sequence Diagram with ${res.objects.length} elements (actors, lifelines, and sequential message arrows) on your whiteboard.`,
      actionTaken: 'generate_sequence',
      createdObjects: res.objects,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10.6. MIND MAP
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('mind map') || lower.includes('mindmap')) {
    const topic = p.replace(/(?:create|generate|make|add)\s*(?:a|an)?\s*mind\s*map\s*(?:for|about|of)?\s*/i, '').trim() || 'Product Growth';
    const res = generateMindMap(
      topic,
      [
        { title: 'User Acquisition', subtopics: ['SEO & Organic', 'Referrals', 'Content Marketing'], color: '#eff6ff' },
        { title: 'Engagement & Retention', subtopics: ['Realtime Sync', 'AI Copilot', 'Templates'], color: '#fef3c7' },
        { title: 'Monetization', subtopics: ['Pro Subscriptions', 'Team Workspaces', 'Enterprise SSO'], color: '#ecfdf5' },
        { title: 'Platform & Extensibility', subtopics: ['Developer APIs', 'Custom Plugins', 'Canvas SDK'], color: '#f3e8ff' },
      ],
      centerX,
      centerY,
      ctx.boardId,
      z
    );

    if (ctx.onAddObjects) ctx.onAddObjects(res.objects);
    return {
      reply: `🧠 Generated Mind Map for "${topic}" with central hub and radiating branches on your whiteboard.`,
      actionTaken: 'generate_mindmap',
      createdObjects: res.objects,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. DIAGRAM / ARCHITECTURE / FLOW
  // ─────────────────────────────────────────────────────────────
  if (
    lower.includes('diagram') ||
    lower.includes('flowchart') ||
    lower.includes('flow') ||
    lower.includes('architecture') ||
    lower.includes('pipeline') ||
    lower.includes('->')
  ) {
    const res = generateDiagramFromPrompt(p, centerX, centerY, ctx.boardId, z);
    if (ctx.onAddObjects) {
      ctx.onAddObjects(res.objects);
    }
    return {
      reply: `📐 Generated diagram for "${res.title}" with ${res.objects.length} elements (shapes, labels, and magnetic connectors) directly placed on your canvas!`,
      actionTaken: 'generate_diagram',
      createdObjects: res.objects,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. CANVAS INSPECTION / QUESTIONS ("what is on this board?")
  // ─────────────────────────────────────────────────────────────
  if (lower.includes('what is on') || lower.includes('how many') || lower.includes('status of board') || lower.includes('inspect')) {
    const count = ctx.objects.length;
    const stickies = ctx.objects.filter((o) => o.type === 'sticky').length;
    const shapes = ctx.objects.filter((o) => o.type !== 'sticky' && o.type !== 'connector' && o.type !== 'text').length;
    const connectors = ctx.objects.filter((o) => o.type === 'connector').length;
    const texts = ctx.objects.filter((o) => o.type === 'text').length;

    return {
      reply: `🔍 Canvas Inspection:\n• Total Objects: ${count}\n• Sticky Notes: ${stickies}\n• Shapes: ${shapes}\n• Connectors: ${connectors}\n• Text Labels: ${texts}\n\nYou can ask me to organize them, convert them to tasks, or add new elements anytime!`,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. DEFAULT AGENT INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  return {
    reply: `I understand you want to work on "${p}". You can ask me directly to:\n• "add a circle" or "draw a red square"\n• "add a sticky saying [your text]"\n• "create a flow for [feature]"\n• "organize my notes" or "summarize the board"\n• "convert notes to sprint tasks"`,
  };
}

