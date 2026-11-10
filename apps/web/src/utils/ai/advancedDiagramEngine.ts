import { BoardObject, ShapeObject, TextObject, ConnectorObject, FrameObject, LineObject } from '@whiteboard/shared';

export interface AdvancedDiagramResult {
  title: string;
  objects: BoardObject[];
}

/**
 * Generates an Actor-Lifeline Sequence Diagram
 */
export function generateSequenceDiagram(
  title: string,
  actors: string[],
  messages: Array<{ from: number; to: number; label: string; isResponse?: boolean }>,
  centerX: number,
  centerY: number,
  boardId: string,
  startZIndex: number
): AdvancedDiagramResult {
  const generated: BoardObject[] = [];
  let currentZ = startZIndex;

  const actorWidth = 140;
  const actorHeight = 50;
  const gapX = 180;
  const lifelineLength = messages.length * 70 + 80;

  const totalWidth = actors.length * (actorWidth + gapX) - gapX;
  const startX = centerX - totalWidth / 2;
  const startY = centerY - lifelineLength / 2;

  const actorCenters: number[] = [];

  // 1. Actors & Lifelines
  actors.forEach((name, idx) => {
    const x = startX + idx * (actorWidth + gapX);
    const centerActorX = x + actorWidth / 2;
    actorCenters.push(centerActorX);

    // Actor Head Box
    const actorBox: ShapeObject = {
      id: `seq-actor-${Date.now()}-${idx}`,
      boardId,
      type: 'rounded-rectangle',
      x,
      y: startY,
      width: actorWidth,
      height: actorHeight,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      fillColor: '#eff6ff',
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      opacity: 1,
      borderRadius: 10,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-sequence',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const actorText: TextObject = {
      id: `seq-actor-txt-${Date.now()}-${idx}`,
      boardId,
      type: 'text',
      x: x + 6,
      y: startY + 14,
      width: actorWidth - 12,
      height: actorHeight - 20,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      text: name,
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#1e3a8a',
      align: 'center',
      createdBy: 'ai-sequence',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Vertical Dashed Lifeline
    const lifeline: LineObject = {
      id: `seq-life-${Date.now()}-${idx}`,
      boardId,
      type: 'line',
      x: centerActorX,
      y: startY + actorHeight,
      width: 0,
      height: lifelineLength,
      startPoint: { x: centerActorX, y: startY + actorHeight },
      endPoint: { x: centerActorX, y: startY + actorHeight + lifelineLength },
      rotation: 0,
      zIndex: startZIndex,
      locked: false,
      strokeColor: '#94a3b8',
      strokeWidth: 2,
      strokeStyle: 'dashed',
      style: 'straight',
      createdBy: 'ai-sequence',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    generated.push(actorBox, actorText, lifeline);
  });

  // 2. Sequential Messages
  messages.forEach((msg, idx) => {
    const fromX = actorCenters[msg.from];
    const toX = actorCenters[msg.to];
    const msgY = startY + actorHeight + 50 + idx * 60;

    const arrow: LineObject = {
      id: `seq-msg-${Date.now()}-${idx}`,
      boardId,
      type: 'arrow',
      x: Math.min(fromX, toX),
      y: msgY,
      width: Math.abs(toX - fromX),
      height: 0,
      startPoint: { x: fromX, y: msgY },
      endPoint: { x: toX, y: msgY },
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      strokeColor: msg.isResponse ? '#10b981' : '#6366f1',
      strokeWidth: 2,
      strokeStyle: msg.isResponse ? 'dashed' : 'solid',
      endArrow: true,
      endArrowStyle: 'triangle',
      style: 'straight',
      createdBy: 'ai-sequence',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const labelText: TextObject = {
      id: `seq-lbl-${Date.now()}-${idx}`,
      boardId,
      type: 'text',
      x: Math.min(fromX, toX) + 12,
      y: msgY - 22,
      width: Math.abs(toX - fromX) - 24,
      height: 20,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      text: `${idx + 1}. ${msg.label}`,
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: msg.isResponse ? '#065f46' : '#3730a3',
      align: 'center',
      createdBy: 'ai-sequence',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    generated.push(arrow, labelText);
  });

  return { title, objects: generated };
}

/**
 * Generates a Hierarchical Mind Map radiating from a central concept
 */
export function generateMindMap(
  centralTopic: string,
  branches: Array<{ title: string; subtopics: string[]; color: string }>,
  centerX: number,
  centerY: number,
  boardId: string,
  startZIndex: number
): AdvancedDiagramResult {
  const generated: BoardObject[] = [];
  let currentZ = startZIndex;

  // Central Hub Node
  const hubWidth = 200;
  const hubHeight = 80;
  const hubId = `mm-hub-${Date.now()}`;

  const hubShape: ShapeObject = {
    id: hubId,
    boardId,
    type: 'rounded-rectangle',
    x: centerX - hubWidth / 2,
    y: centerY - hubHeight / 2,
    width: hubWidth,
    height: hubHeight,
    rotation: 0,
    zIndex: currentZ++,
    locked: false,
    fillColor: '#f3e8ff',
    strokeColor: '#9333ea',
    strokeWidth: 3,
    opacity: 1,
    borderRadius: 20,
    fillStyle: 'solid',
    strokeStyle: 'solid',
    createdBy: 'ai-mindmap',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const hubText: TextObject = {
    id: `mm-hub-txt-${Date.now()}`,
    boardId,
    type: 'text',
    x: centerX - hubWidth / 2 + 10,
    y: centerY - 14,
    width: hubWidth - 20,
    height: 40,
    rotation: 0,
    zIndex: currentZ++,
    locked: false,
    text: centralTopic,
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#581c87',
    align: 'center',
    createdBy: 'ai-mindmap',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  generated.push(hubShape, hubText);

  // Radiating branches
  const totalBranches = branches.length;
  const radius = 320;

  branches.forEach((b, idx) => {
    const angle = (idx / totalBranches) * 2 * Math.PI - Math.PI / 2;
    const branchX = Math.round(centerX + Math.cos(angle) * radius - 80);
    const branchY = Math.round(centerY + Math.sin(angle) * (radius * 0.75) - 35);

    const branchShapeId = `mm-b-${Date.now()}-${idx}`;
    const branchShape: ShapeObject = {
      id: branchShapeId,
      boardId,
      type: 'rounded-rectangle',
      x: branchX,
      y: branchY,
      width: 170,
      height: 70,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      fillColor: b.color || '#eff6ff',
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      opacity: 1,
      borderRadius: 12,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-mindmap',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const branchText: TextObject = {
      id: `mm-b-txt-${Date.now()}-${idx}`,
      boardId,
      type: 'text',
      x: branchX + 8,
      y: branchY + 12,
      width: 154,
      height: 46,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      text: `${b.title}\n${b.subtopics.slice(0, 2).map((s) => `• ${s}`).join('\n')}`,
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#0f172a',
      align: 'left',
      createdBy: 'ai-mindmap',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Curved connector from hub to branch
    const connector: ConnectorObject = {
      id: `mm-conn-${Date.now()}-${idx}`,
      boardId,
      type: 'connector',
      x: centerX,
      y: centerY,
      width: branchX - centerX,
      height: branchY - centerY,
      rotation: 0,
      zIndex: startZIndex,
      locked: false,
      fromObject: hubId,
      fromAnchor: 'center',
      toObject: branchShapeId,
      toAnchor: 'center',
      strokeColor: '#9333ea',
      strokeWidth: 2,
      style: 'straight',
      startArrow: false,
      endArrow: false,
      strokeStyle: 'solid',
      createdBy: 'ai-mindmap',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    generated.push(branchShape, branchText, connector);
  });

  return { title: `Mind Map: ${centralTopic}`, objects: generated };
}

