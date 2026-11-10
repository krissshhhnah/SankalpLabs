import { BoardObject, StickyObject, TextObject, ShapeObject, ConnectorObject } from '@whiteboard/shared';

export interface NextStepSuggestion {
  label: string;
  type: 'process' | 'decision' | 'database';
  color: string;
}

const DOMAIN_SUGGESTIONS: Record<string, NextStepSuggestion[]> = {
  auth: [
    { label: 'Validate Password Hash', type: 'process', color: '#eff6ff' },
    { label: 'Verify 2FA Token', type: 'decision', color: '#fef3c7' },
    { label: 'Issue Signed JWT', type: 'process', color: '#dcfce7' },
  ],
  login: [
    { label: 'Verify Credentials', type: 'decision', color: '#fef3c7' },
    { label: 'Set Session Cookie', type: 'process', color: '#eff6ff' },
    { label: 'Redirect to Dashboard', type: 'process', color: '#dcfce7' },
  ],
  payment: [
    { label: 'Verify Card Balance', type: 'decision', color: '#fef3c7' },
    { label: 'Stripe Charge Capture', type: 'process', color: '#eff6ff' },
    { label: 'Send Receipt Email', type: 'process', color: '#dcfce7' },
  ],
  checkout: [
    { label: 'Reserve Inventory', type: 'process', color: '#eff6ff' },
    { label: 'Calculate Sales Tax', type: 'process', color: '#f3e8ff' },
    { label: 'Payment Gateway', type: 'decision', color: '#fef3c7' },
  ],
  api: [
    { label: 'Rate Limit & Auth Check', type: 'decision', color: '#fef3c7' },
    { label: 'Query Redis Cache', type: 'database', color: '#ecfdf5' },
    { label: 'Database Write Transaction', type: 'database', color: '#eff6ff' },
  ],
  database: [
    { label: 'Query Execution', type: 'process', color: '#eff6ff' },
    { label: 'Update Index', type: 'process', color: '#f3e8ff' },
    { label: 'Return JSON Records', type: 'process', color: '#dcfce7' },
  ],
  deploy: [
    { label: 'Run Automated Tests', type: 'decision', color: '#fef3c7' },
    { label: 'Build Production Container', type: 'process', color: '#eff6ff' },
    { label: 'Zero-Downtime Rollout', type: 'process', color: '#dcfce7' },
  ],
  test: [
    { label: 'Evaluate Test Coverage', type: 'decision', color: '#fef3c7' },
    { label: 'Generate Bug Report', type: 'process', color: '#fee2e2' },
    { label: 'Merge Pull Request', type: 'process', color: '#dcfce7' },
  ],
  user: [
    { label: 'Fetch User Profile', type: 'process', color: '#eff6ff' },
    { label: 'Check Permissions / RBAC', type: 'decision', color: '#fef3c7' },
    { label: 'Render Activity Feed', type: 'process', color: '#dcfce7' },
  ],
};

const DEFAULT_SUGGESTIONS: NextStepSuggestion[] = [
  { label: 'Process & Validate', type: 'process', color: '#eff6ff' },
  { label: 'Decision Review', type: 'decision', color: '#fef3c7' },
  { label: 'Persist & Notify', type: 'process', color: '#dcfce7' },
];

/**
 * Extracts object text and predicts logical next steps in a workflow
 */
export function predictNextSteps(object: BoardObject): NextStepSuggestion[] {
  let content = '';

  if (object.type === 'sticky') {
    content = (object as StickyObject).text || '';
  } else if (object.type === 'text') {
    content = (object as TextObject).text || '';
  } else if (object.type === 'rounded-rectangle' || object.type === 'rectangle' || object.type === 'diamond') {
    content = object.id || '';
  }

  const lower = content.toLowerCase();

  for (const [key, suggestions] of Object.entries(DOMAIN_SUGGESTIONS)) {
    if (lower.includes(key)) {
      return suggestions;
    }
  }

  return DEFAULT_SUGGESTIONS;
}

/**
 * Creates the next node and a smart magnetic connector attached to the source node
 */
export function createChainedNodeAndConnector(
  sourceObject: BoardObject,
  suggestion: NextStepSuggestion,
  boardId: string,
  startZIndex: number
): { newNode: BoardObject; connector: ConnectorObject } {
  const isDecision = suggestion.type === 'decision';
  const shapeType = isDecision ? 'diamond' : 'rounded-rectangle';
  const nodeWidth = 190;
  const nodeHeight = isDecision ? 120 : 80;

  // Offset 140px to the right of source object
  const newX = sourceObject.x + (sourceObject.width || 180) + 140;
  const newY = sourceObject.y + (sourceObject.height || 100) / 2 - nodeHeight / 2;

  const newNodeId = `ai-node-${Date.now()}`;
  const newNode: ShapeObject = {
    id: newNodeId,
    boardId,
    type: shapeType,
    x: newX,
    y: newY,
    width: nodeWidth,
    height: nodeHeight,
    rotation: 0,
    zIndex: startZIndex + 1,
    locked: false,
    fillColor: suggestion.color,
    strokeColor: isDecision ? '#f59e0b' : '#3b82f6',
    strokeWidth: 2,
    opacity: 1,
    borderRadius: isDecision ? undefined : 12,
    fillStyle: 'solid',
    strokeStyle: 'solid',
    createdBy: 'ai-autocomplete',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const connectorId = `ai-conn-${Date.now()}`;
  const connector: ConnectorObject = {
    id: connectorId,
    boardId,
    type: 'connector',
    x: sourceObject.x + sourceObject.width,
    y: sourceObject.y + sourceObject.height / 2,
    width: newX - (sourceObject.x + sourceObject.width),
    height: newY - sourceObject.y,
    rotation: 0,
    zIndex: startZIndex,
    locked: false,
    fromObject: sourceObject.id,
    fromAnchor: 'right',
    toObject: newNodeId,
    toAnchor: 'left',
    strokeColor: '#64748b',
    strokeWidth: 2,
    style: 'elbow',
    startArrow: false,
    endArrow: true,
    endArrowStyle: 'triangle',
    strokeStyle: 'solid',
    createdBy: 'ai-autocomplete',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { newNode, connector };
}

