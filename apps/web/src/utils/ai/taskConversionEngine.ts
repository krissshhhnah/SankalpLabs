import { BoardObject, StickyObject, TextObject, ShapeObject } from '@whiteboard/shared';

export interface ConvertedTask {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
}

export function convertObjectsToTasks(
  objects: BoardObject[],
  centerX: number,
  centerY: number,
  boardId: string,
  startZIndex: number = 150
): BoardObject[] {
  const extractedItems: string[] = [];

  objects.forEach((obj) => {
    if (obj.type === 'sticky') {
      const txt = (obj as StickyObject).text?.trim();
      if (txt) extractedItems.push(txt);
    } else if (obj.type === 'text') {
      const txt = (obj as TextObject).text?.trim();
      if (txt) extractedItems.push(txt);
    } else if (obj.type === 'rounded-rectangle' || obj.type === 'rectangle' || obj.type === 'diamond') {
      // Find matching text or use id
      extractedItems.push(`Milestone Task #${extractedItems.length + 1}`);
    }
  });

  const items = extractedItems.length > 0 ? extractedItems : [
    'Define API schema contracts',
    'Build real-time Yjs synchronization service',
    'Implement PixiJS hardware-accelerated renderer',
    'Write end-to-end integration test suite',
  ];

  const PRIORITY_COLORS: Record<string, string> = {
    High: '#fee2e2', // Red
    Medium: '#fef3c7', // Amber
    Low: '#ecfdf5', // Green
  };

  const tasks: ConvertedTask[] = items.slice(0, 8).map((it, idx) => {
    const lines = it.split('\n');
    const title = lines[0].substring(0, 40);
    const desc = lines.slice(1).join(' ').trim() || 'Tracked task item converted from visual canvas.';
    const priority = idx % 3 === 0 ? 'High' : idx % 3 === 1 ? 'Medium' : 'Low';
    return {
      title,
      description: desc,
      priority,
      status: 'To Do',
    };
  });

  const generatedCards: BoardObject[] = [];
  let currentZ = startZIndex;

  const cardWidth = 220;
  const cardHeight = 160;
  const gapX = 30;
  const gapY = 30;
  const cols = 3;

  const startX = centerX - ((cols * (cardWidth + gapX)) - gapX) / 2;
  const startY = centerY - 100;

  tasks.forEach((task, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const stickyId = `ai-task-${Date.now()}-${idx}`;
    const stickyObj: StickyObject = {
      id: stickyId,
      boardId,
      type: 'sticky',
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      color: PRIORITY_COLORS[task.priority] || '#fef08a',
      text: `[${task.priority.toUpperCase()} PRIORITY]\n\n${task.title}\n\n• Status: ${task.status}\n• Details: ${task.description.substring(0, 60)}`,
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      textAlign: 'left',
      textColor: '#0f172a',
      createdBy: 'ai-assistant',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    generatedCards.push(stickyObj);
  });

  return generatedCards;
}

