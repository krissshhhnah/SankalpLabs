import { BoardObject, ShapeObject, TextObject, ConnectorObject, FrameObject, StickyObject } from '@whiteboard/shared';

export interface DiagramNode {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'database' | 'start-end' | 'service';
  color?: string;
  sublabel?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'straight' | 'elbow';
}

export interface GeneratedDiagram {
  title: string;
  objects: BoardObject[];
}

const SHAPE_PALETTES = {
  process: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a' }, // Blue
  decision: { fill: '#fef3c7', stroke: '#f59e0b', text: '#78350f' }, // Amber
  database: { fill: '#ecfdf5', stroke: '#10b981', text: '#064e3b' }, // Emerald
  'start-end': { fill: '#f3e8ff', stroke: '#a855f7', text: '#581c87' }, // Purple
  service: { fill: '#f1f5f9', stroke: '#64748b', text: '#0f172a' }, // Slate
};

/**
 * Deterministic Text-to-Diagram Generator
 * Translates prompts or pipeline definitions into positioned shapes & connectors
 */
export function generateDiagramFromPrompt(
  prompt: string,
  centerX: number,
  centerY: number,
  boardId: string,
  startZIndex: number = 100
): GeneratedDiagram {
  const p = prompt.toLowerCase();
  let title = 'System Architecture Flow';
  let nodes: DiagramNode[] = [];
  let edges: DiagramEdge[] = [];

  if (p.includes('auth') || p.includes('login') || p.includes('signup') || p.includes('jwt')) {
    title = 'User Authentication & JWT Flow';
    nodes = [
      { id: 'n1', label: 'Client App (Web/Mobile)', type: 'start-end', sublabel: 'React / Next.js' },
      { id: 'n2', label: 'API Gateway', type: 'service', sublabel: 'Fastify / Kong' },
      { id: 'n3', label: 'Credentials Valid?', type: 'decision', sublabel: 'Bcrypt Hash Verify' },
      { id: 'n4', label: 'User Database', type: 'database', sublabel: 'PostgreSQL User Record' },
      { id: 'n5', label: 'Issue Signed JWT', type: 'process', sublabel: 'HMAC-SHA256 Token' },
      { id: 'n6', label: 'Return 401 Unauthorized', type: 'process', sublabel: 'Error Response' },
      { id: 'n7', label: 'Dashboard Access Granted', type: 'start-end', sublabel: 'Session Active' },
    ];
    edges = [
      { from: 'n1', to: 'n2', label: 'POST /api/login' },
      { from: 'n2', to: 'n4', label: 'Query User by Email' },
      { from: 'n4', to: 'n3', label: 'Return User & Hash' },
      { from: 'n3', to: 'n5', label: 'Valid Password' },
      { from: 'n3', to: 'n6', label: 'Invalid Password' },
      { from: 'n5', to: 'n7', label: '200 OK + Auth Header' },
    ];
  } else if (p.includes('payment') || p.includes('checkout') || p.includes('stripe') || p.includes('order')) {
    title = 'E-Commerce Payment & Order Pipeline';
    nodes = [
      { id: 'n1', label: 'Customer Checkout', type: 'start-end', sublabel: 'Cart Summary & Pay' },
      { id: 'n2', label: 'Order Orchestrator', type: 'service', sublabel: 'Order Management API' },
      { id: 'n3', label: 'Inventory Reserved?', type: 'decision', sublabel: 'Stock Verification' },
      { id: 'n4', label: 'Payment Gateway', type: 'service', sublabel: 'Stripe / Adyen Process' },
      { id: 'n5', label: 'Payment Succeeded?', type: 'decision', sublabel: '3D Secure Verification' },
      { id: 'n6', label: 'Order DB', type: 'database', sublabel: 'Save Confirmed Order' },
      { id: 'n7', label: 'Notification Queue', type: 'process', sublabel: 'Send Email / Invoice' },
      { id: 'n8', label: 'Order Complete', type: 'start-end', sublabel: 'Delivery Tracking Active' },
    ];
    edges = [
      { from: 'n1', to: 'n2', label: 'Submit Order' },
      { from: 'n2', to: 'n3', label: 'Check Stock' },
      { from: 'n3', to: 'n4', label: 'Stock Confirmed' },
      { from: 'n4', to: 'n5', label: 'Charge Customer' },
      { from: 'n5', to: 'n6', label: 'Payment Captured' },
      { from: 'n6', to: 'n7', label: 'Dispatch Event' },
      { from: 'n7', to: 'n8', label: 'Notify Customer' },
    ];
  } else if (p.includes('microservice') || p.includes('cloud') || p.includes('kubernetes') || p.includes('backend')) {
    title = 'Cloud Microservices Architecture';
    nodes = [
      { id: 'n1', label: 'Global CDN / DNS', type: 'start-end', sublabel: 'Cloudflare / Edge' },
      { id: 'n2', label: 'Load Balancer', type: 'service', sublabel: 'Traefik / Nginx Ingress' },
      { id: 'n3', label: 'Core Whiteboard API', type: 'process', sublabel: 'Fastify Node.js Service' },
      { id: 'n4', label: 'Yjs Realtime WebSocket', type: 'process', sublabel: 'Room CRDT Sync Server' },
      { id: 'n5', label: 'Redis Pub/Sub', type: 'database', sublabel: 'Presence & State Cache' },
      { id: 'n6', label: 'PostgreSQL Cluster', type: 'database', sublabel: 'Persistent Boards & Users' },
      { id: 'n7', label: 'S3 Asset Bucket', type: 'database', sublabel: 'Images, PDFs & Exports' },
    ];
    edges = [
      { from: 'n1', to: 'n2', label: 'HTTPS Traffic' },
      { from: 'n2', to: 'n3', label: 'REST Requests' },
      { from: 'n2', to: 'n4', label: 'WSS Upgrade' },
      { from: 'n4', to: 'n5', label: 'Room Broadcasts' },
      { from: 'n3', to: 'n6', label: 'Prisma CRUD' },
      { from: 'n3', to: 'n7', label: 'Pre-signed Upload' },
    ];
  } else if (p.includes('ci') || p.includes('cd') || p.includes('deploy') || p.includes('devops')) {
    title = 'Continuous Deployment (CI/CD) Pipeline';
    nodes = [
      { id: 'n1', label: 'Git Push (Main)', type: 'start-end', sublabel: 'GitHub Webhook' },
      { id: 'n2', label: 'Linter & Unit Tests', type: 'process', sublabel: 'Vitest + ESLint' },
      { id: 'n3', label: 'Tests Passed?', type: 'decision', sublabel: '100% Coverage Gate' },
      { id: 'n4', label: 'Docker Container Build', type: 'process', sublabel: 'Multi-stage Production' },
      { id: 'n5', label: 'Staging Auto-Deploy', type: 'service', sublabel: 'Smoke Test Suite' },
      { id: 'n6', label: 'Production Release', type: 'start-end', sublabel: 'Zero-Downtime Rollout' },
    ];
    edges = [
      { from: 'n1', to: 'n2', label: 'Trigger Workflow' },
      { from: 'n2', to: 'n3', label: 'Evaluate Results' },
      { from: 'n3', to: 'n4', label: 'Success' },
      { from: 'n4', to: 'n5', label: 'Push Image' },
      { from: 'n5', to: 'n6', label: 'Promote to Prod' },
    ];
  } else {
    // Dynamic Parser for custom user prompt (e.g. "Step A -> Step B -> Step C")
    title = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt;
    const rawSteps = prompt
      .split(/->|-->|then|next|,|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const steps = rawSteps.length >= 3 ? rawSteps.slice(0, 7) : [
      'Input Brief & Requirements',
      'Architecture Evaluation',
      'Feasibility Review',
      'System Implementation',
      'Quality Verification',
      'Production Launch'
    ];

    nodes = steps.map((s, idx) => ({
      id: `n${idx + 1}`,
      label: s,
      type: idx === 0 || idx === steps.length - 1 ? 'start-end' : s.includes('?') ? 'decision' : 'process',
      sublabel: `Phase ${idx + 1}`
    }));

    edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: i === 0 ? 'Initiate' : undefined
      });
    }
  }

  // Hierarchical Layout Calculation (Left-to-Right or Top-to-Bottom)
  const isWide = nodes.length <= 5;
  const nodeWidth = 200;
  const nodeHeight = 84;
  const gapX = 140;
  const gapY = 120;

  const totalWidth = isWide ? nodes.length * (nodeWidth + gapX) - gapX : 3 * (nodeWidth + gapX) - gapX;
  const startX = centerX - totalWidth / 2;
  const startY = centerY - 140;

  const nodeMap = new Map<string, { x: number; y: number; id: string }>();
  const generatedObjects: BoardObject[] = [];
  let currentZ = startZIndex;

  // Frame container for clean grouping
  const frameId = `ai-frame-${Date.now()}`;
  const frameObj: FrameObject = {
    id: frameId,
    boardId,
    type: 'frame',
    title: `AI Diagram: ${title}`,
    x: startX - 40,
    y: startY - 70,
    width: totalWidth + 80,
    height: isWide ? nodeHeight + 140 : Math.ceil(nodes.length / 3) * (nodeHeight + gapY) + 120,
    rotation: 0,
    zIndex: currentZ++,
    locked: false,
    fillColor: '#f8fafc',
    strokeColor: '#cbd5e1',
    createdBy: 'ai-assistant',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childIds: [],
  };

  nodes.forEach((n, idx) => {
    let col = idx;
    let row = 0;
    if (!isWide) {
      col = idx % 3;
      row = Math.floor(idx / 3);
    }

    const x = startX + col * (nodeWidth + gapX);
    const y = startY + row * (nodeHeight + gapY);
    nodeMap.set(n.id, { x, y, id: n.id });

    const pal = SHAPE_PALETTES[n.type] || SHAPE_PALETTES.process;
    const shapeType = n.type === 'decision' ? 'diamond' : 'rounded-rectangle';

    // Node Shape
    const shapeId = `ai-shape-${Date.now()}-${n.id}`;
    const shapeObj: ShapeObject = {
      id: shapeId,
      boardId,
      type: shapeType,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      fillColor: pal.fill,
      strokeColor: pal.stroke,
      strokeWidth: 2,
      opacity: 1,
      borderRadius: shapeType === 'diamond' ? undefined : 12,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      createdBy: 'ai-assistant',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Node Text Label
    const textId = `ai-text-${Date.now()}-${n.id}`;
    const textObj: TextObject = {
      id: textId,
      boardId,
      type: 'text',
      x: x + 10,
      y: y + (n.sublabel ? 16 : 28),
      width: nodeWidth - 20,
      height: nodeHeight - 20,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      text: n.sublabel ? `${n.label}\n${n.sublabel}` : n.label,
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: pal.text,
      align: 'center',
      createdBy: 'ai-assistant',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    frameObj.childIds.push(shapeId, textId);
    generatedObjects.push(shapeObj, textObj);
  });

  // Connectors
  edges.forEach((edge, idx) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const fromShapeId = `ai-shape-${Date.now()}-${edge.from}`;
    const toShapeId = `ai-shape-${Date.now()}-${edge.to}`;

    const connectorId = `ai-conn-${Date.now()}-${idx}`;
    const connObj: ConnectorObject = {
      id: connectorId,
      boardId,
      type: 'connector',
      x: fromNode.x + nodeWidth,
      y: fromNode.y + nodeHeight / 2,
      width: toNode.x - (fromNode.x + nodeWidth),
      height: toNode.y - fromNode.y,
      rotation: 0,
      zIndex: currentZ++,
      locked: false,
      fromObject: fromShapeId,
      fromAnchor: isWide ? 'right' : 'bottom',
      toObject: toShapeId,
      toAnchor: isWide ? 'left' : 'top',
      strokeColor: '#64748b',
      strokeWidth: 2,
      style: edge.style || 'elbow',
      startArrow: false,
      endArrow: true,
      endArrowStyle: 'triangle',
      strokeStyle: 'solid',
      createdBy: 'ai-assistant',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    frameObj.childIds.push(connectorId);
    generatedObjects.push(connObj);
  });

  // Add the enclosing frame in the background
  generatedObjects.unshift(frameObj);

  return {
    title,
    objects: generatedObjects,
  };
}

