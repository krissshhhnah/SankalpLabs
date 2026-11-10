import { jsPDF } from 'jspdf';
import { BoardObject, FrameObject, Point, ConnectorObject } from '@whiteboard/shared';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface Bounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export function computeObjectsBounds(objects: BoardObject[], padding = 40): Bounds {
  if (objects.length === 0) {
    return { minX: 0, minY: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of objects) {
    const x = obj.x ?? 0;
    const y = obj.y ?? 0;
    const w = obj.width ?? 100;
    const h = obj.height ?? 100;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);

    if (obj.type === 'drawing' && (obj as any).points?.length) {
      for (const p of (obj as any).points as Point[]) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    }

    if (obj.type === 'line' || obj.type === 'arrow' || obj.type === 'curved-arrow') {
      const line = obj as any;
      minX = Math.min(minX, line.startX ?? x, line.endX ?? x);
      minY = Math.min(minY, line.startY ?? y, line.endY ?? y);
      maxX = Math.max(maxX, line.startX ?? x, line.endX ?? x);
      maxY = Math.max(maxY, line.startY ?? y, line.endY ?? y);
    }
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX: Math.round(minX),
    minY: Math.round(minY),
    width: Math.max(200, Math.round(maxX - minX)),
    height: Math.max(200, Math.round(maxY - minY)),
  };
}

function getShapePolygonPoints(type: string, x: number, y: number, w: number, h: number): string {
  if (type === 'triangle') {
    return `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`;
  }
  if (type === 'diamond') {
    return `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
  }
  if (type === 'hexagon') {
    const qW = w / 4;
    return `${x + qW},${y} ${x + w - qW},${y} ${x + w},${y + h / 2} ${x + w - qW},${y + h} ${x + qW},${y + h} ${x},${y + h / 2}`;
  }
  if (type === 'star') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.42;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  }
  return '';
}

export function generateSvgString(
  objects: BoardObject[],
  options?: {
    bounds?: Bounds;
    background?: string;
    padding?: number;
  }
): string {
  const bounds = options?.bounds || computeObjectsBounds(objects, options?.padding ?? 40);
  const bgColor = options?.background || '#f8fafc';

  const sortedObjects = [...objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  const defs = `
  <defs>
    <filter id="sticky-shadow" x="-8%" y="-8%" width="120%" height="125%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>
    <marker id="arrow-head" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
    </marker>
    <marker id="arrow-head-colored" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
    </marker>
  </defs>
  `;

  let elementsSvg = '';

  for (const obj of sortedObjects) {
    const x = obj.x ?? 0;
    const y = obj.y ?? 0;
    const w = obj.width ?? 100;
    const h = obj.height ?? 100;
    const rot = obj.rotation ?? 0;
    const transform = rot !== 0 ? ` transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"` : '';

    if (obj.type === 'frame') {
      const frame = obj as FrameObject;
      const titleEsc = escapeXml(frame.title || 'Frame');
      const titleW = Math.min(220, Math.max(60, titleEsc.length * 9 + 16));
      elementsSvg += `
      <g id="${frame.id}"${transform}>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${frame.fillColor || '#ffffff'}" stroke="${frame.strokeColor || '#94a3b8'}" stroke-width="2" stroke-dasharray="6 4" rx="8" />
        <rect x="${x}" y="${y - 26}" width="${titleW}" height="22" rx="6" fill="#3b82f6" />
        <text x="${x + 8}" y="${y - 11}" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600">${titleEsc}</text>
      </g>
      `;
    } else if (obj.type === 'sticky') {
      const sticky = obj as any;
      const textLines = (sticky.text || '').split('\n');
      const fontSize = sticky.fontSize || 16;
      const lineHeight = fontSize * 1.35;
      const textColor = sticky.textColor || '#0f172a';
      const padX = 14;
      const padY = 18;

      let tspans = '';
      textLines.forEach((line: string, idx: number) => {
        tspans += `<tspan x="${x + padX}" y="${y + padY + idx * lineHeight + fontSize}">${escapeXml(line)}</tspan>`;
      });

      elementsSvg += `
      <g id="${sticky.id}"${transform} filter="url(#sticky-shadow)">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="${sticky.color || '#fef08a'}" stroke="#000000" stroke-opacity="0.06" stroke-width="1" />
        <text fill="${textColor}" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="500">
          ${tspans}
        </text>
      </g>
      `;
    } else if (obj.type === 'text') {
      const textObj = obj as any;
      const textLines = (textObj.text || '').split('\n');
      const fontSize = textObj.fontSize || 18;
      const lineHeight = fontSize * 1.35;
      const fontFamily = textObj.fontFamily || 'Inter, system-ui, sans-serif';
      const fontColor = textObj.color || '#0f172a';
      const align = textObj.align || 'left';
      const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
      const anchorX = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;

      let tspans = '';
      textLines.forEach((line: string, idx: number) => {
        tspans += `<tspan x="${anchorX}" y="${y + idx * lineHeight + fontSize}">${escapeXml(line)}</tspan>`;
      });

      elementsSvg += `
      <g id="${textObj.id}"${transform}>
        <text text-anchor="${anchor}" fill="${fontColor}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${textObj.fontWeight || 'normal'}" font-style="${textObj.fontStyle || 'normal'}">
          ${tspans}
        </text>
      </g>
      `;
    } else if (
      obj.type === 'rectangle' ||
      obj.type === 'rounded-rectangle' ||
      obj.type === 'ellipse' ||
      obj.type === 'triangle' ||
      obj.type === 'diamond' ||
      obj.type === 'star' ||
      obj.type === 'hexagon' ||
      obj.type === 'bubble'
    ) {
      const shape = obj as any;
      const fill = shape.fillColor || 'transparent';
      const stroke = shape.strokeColor || '#0f172a';
      const sw = shape.strokeWidth || 2;
      const opacity = shape.opacity ?? 1;
      let dash = '';
      if (shape.strokeStyle === 'dashed') dash = ' stroke-dasharray="8 6"';
      if (shape.strokeStyle === 'dotted') dash = ' stroke-dasharray="3 3"';

      let shapeEl = '';
      if (shape.type === 'rectangle') {
        shapeEl = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} opacity="${opacity}" />`;
      } else if (shape.type === 'rounded-rectangle') {
        shapeEl = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ry="14" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} opacity="${opacity}" />`;
      } else if (shape.type === 'ellipse') {
        shapeEl = `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} opacity="${opacity}" />`;
      } else if (shape.type === 'bubble') {
        const r = 12;
        const bodyH = h - 16;
        shapeEl = `
        <path d="M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + bodyH - r} Q ${x + w} ${y + bodyH} ${x + w - r} ${y + bodyH} L ${x + 36} ${y + bodyH} L ${x + 20} ${y + h} L ${x + 24} ${y + bodyH} L ${x + r} ${y + bodyH} Q ${x} ${y + bodyH} ${x} ${y + bodyH - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} opacity="${opacity}" />
        `;
      } else {
        const pts = getShapePolygonPoints(shape.type, x, y, w, h);
        shapeEl = `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} opacity="${opacity}" />`;
      }

      let textEl = '';
      if (shape.text) {
        const textLines = (shape.text as string).split('\n');
        const fontSize = shape.fontSize || 14;
        const lineHeight = fontSize * 1.35;
        const totalTextH = textLines.length * lineHeight;
        const startY = y + (h - totalTextH) / 2 + fontSize * 0.85;
        const textColor = shape.textColor || stroke;

        let tspans = '';
        textLines.forEach((line, idx) => {
          tspans += `<tspan x="${x + w / 2}" y="${startY + idx * lineHeight}">${escapeXml(line)}</tspan>`;
        });
        textEl = `<text text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="500">${tspans}</text>`;
      }

      elementsSvg += `
      <g id="${shape.id}"${transform}>
        ${shapeEl}
        ${textEl}
      </g>
      `;
    } else if (obj.type === 'drawing') {
      const drawing = obj as any;
      const pts = (drawing.points || []) as Point[];
      if (pts.length > 1) {
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          d += ` L ${pts[i].x} ${pts[i].y}`;
        }
        elementsSvg += `
        <path id="${drawing.id}" d="${d}" fill="none" stroke="${drawing.color || '#0f172a'}" stroke-width="${drawing.strokeWidth || 3}" stroke-linecap="round" stroke-linejoin="round" opacity="${drawing.opacity ?? 1}"${transform} />
        `;
      }
    } else if (obj.type === 'line' || obj.type === 'arrow' || obj.type === 'curved-arrow') {
      const line = obj as any;
      const sx = line.startX ?? x;
      const sy = line.startY ?? y;
      const ex = line.endX ?? x + w;
      const ey = line.endY ?? y + h;
      const strokeColor = line.strokeColor || '#334155';
      const strokeWidth = line.strokeWidth || 2;
      const markerEnd = line.arrowEnd || line.type === 'arrow' || line.type === 'curved-arrow' ? ' marker-end="url(#arrow-head)"' : '';

      if (line.type === 'curved-arrow') {
        const mx = (sx + ex) / 2 + (ey - sy) * 0.25;
        const my = (sy + ey) / 2 - (ex - sx) * 0.25;
        elementsSvg += `
        <path id="${line.id}" d="M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"${markerEnd}${transform} />
        `;
      } else {
        elementsSvg += `
        <line id="${line.id}" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${markerEnd}${transform} />
        `;
      }
    } else if (obj.type === 'connector') {
      const conn = obj as ConnectorObject;
      const fromObj = conn.fromObject ? objects.find((o) => o.id === conn.fromObject) : null;
      const toObj = conn.toObject ? objects.find((o) => o.id === conn.toObject) : null;

      const getAnchorPoint = (o: BoardObject, anchor?: string): Point => {
        const ox = o.x ?? 0;
        const oy = o.y ?? 0;
        const ow = o.width ?? 100;
        const oh = o.height ?? 100;
        if (anchor === 'top') return { x: ox + ow / 2, y: oy };
        if (anchor === 'right') return { x: ox + ow, y: oy + oh / 2 };
        if (anchor === 'bottom') return { x: ox + ow / 2, y: oy + oh };
        if (anchor === 'left') return { x: ox, y: oy + oh / 2 };
        return { x: ox + ow / 2, y: oy + oh / 2 };
      };

      const p1: Point = fromObj ? getAnchorPoint(fromObj, conn.fromAnchor) : conn.fromPoint || { x, y };
      const p2: Point = toObj ? getAnchorPoint(toObj, conn.toAnchor) : conn.toPoint || { x: x + w, y: y + h };
      const color = conn.strokeColor || '#64748b';
      const sw = conn.strokeWidth || 2;
      const markerEnd = conn.endArrow !== false ? ' marker-end="url(#arrow-head)"' : '';
      const markerStart = conn.startArrow ? ' marker-start="url(#arrow-head)"' : '';

      let d = `M ${p1.x} ${p1.y}`;
      if (conn.style === 'elbow') {
        const midX = (p1.x + p2.x) / 2;
        d = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
      } else {
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      }

      elementsSvg += `
      <path id="${conn.id}" d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"${markerEnd}${markerStart}${transform} />
      `;
    } else if (obj.type === 'image') {
      const imgObj = obj as any;
      if (imgObj.src) {
        elementsSvg += `
        <image id="${imgObj.id}" href="${imgObj.src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"${transform} />
        `;
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${bgColor}" />
  ${defs}
  ${elementsSvg}
</svg>`;
}

export function exportSvg(
  boardName: string,
  objects: BoardObject[],
  options?: { background?: string }
): void {
  const svgString = generateSvgString(objects, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (boardName || 'whiteboard').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${safeName}_vector.svg`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function svgToImageDataUrl(svgString: string, width: number, height: number, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas 2D context unavailable'));
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

export async function exportHighResPng(
  boardName: string,
  objects: BoardObject[],
  scale = 2,
  options?: { background?: string }
): Promise<void> {
  const bounds = computeObjectsBounds(objects, 40);
  const svgString = generateSvgString(objects, { bounds, background: options?.background || '#ffffff' });
  const dataUrl = await svgToImageDataUrl(svgString, bounds.width, bounds.height, scale);

  const link = document.createElement('a');
  const safeName = (boardName || 'whiteboard').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${safeName}_retina_${scale}x.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportMultiPagePdf(
  boardName: string,
  objects: BoardObject[],
  onProgress?: (msg: string) => void
): Promise<void> {
  const safeName = (boardName || 'whiteboard').replace(/[^a-z0-9]/gi, '_').toLowerCase();

  // 1. Check for Frames (slides)
  const frames = (objects.filter((o) => o.type === 'frame') as FrameObject[]).sort((a, b) => {
    if (Math.abs(a.y - b.y) > 100) return a.y - b.y;
    return a.x - b.x;
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 36;
  const headerHeight = 32;
  const footerHeight = 24;

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - headerHeight - footerHeight;

  if (frames.length > 0) {
    // Multi-page frame slide deck
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (onProgress) onProgress(`Exporting Slide ${i + 1} of ${frames.length}: "${frame.title || 'Untitled'}"...`);

      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      // Find objects inside or intersecting this frame
      const frameObjs = objects.filter((o) => {
        if (o.id === frame.id) return true;
        const ox = o.x ?? 0;
        const oy = o.y ?? 0;
        const ow = o.width ?? 50;
        const oh = o.height ?? 50;
        // Intersection check
        return ox < frame.x + frame.width && ox + ow > frame.x && oy < frame.y + frame.height && oy + oh > frame.y;
      });

      const frameBounds: Bounds = {
        minX: frame.x,
        minY: frame.y,
        width: Math.max(100, frame.width),
        height: Math.max(100, frame.height),
      };

      const svgStr = generateSvgString(frameObjs, {
        bounds: frameBounds,
        background: frame.fillColor || '#ffffff',
      });

      try {
        const imgData = await svgToImageDataUrl(svgStr, frameBounds.width, frameBounds.height, 2);

        // Aspect ratio fit
        const scale = Math.min(contentWidth / frameBounds.width, contentHeight / frameBounds.height);
        const drawW = frameBounds.width * scale;
        const drawH = frameBounds.height * scale;
        const drawX = margin + (contentWidth - drawW) / 2;
        const drawY = margin + headerHeight + (contentHeight - drawH) / 2;

        // Draw Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(30, 41, 59);
        pdf.text(frame.title || `Slide ${i + 1}`, margin, margin + 18);

        // Draw Slide Box Shadow/Border
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(drawX, drawY, drawW, drawH, 'S');

        // Draw Slide Image
        pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH);

        // Draw Footer
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(boardName, margin, pageHeight - margin);
        const pageStr = `${i + 1} / ${frames.length}`;
        pdf.text(pageStr, pageWidth - margin - pdf.getTextWidth(pageStr), pageHeight - margin);
      } catch (err) {
        console.error('Error rendering slide to PDF:', err);
      }
    }
  } else {
    // Single page high-res board overview
    if (onProgress) onProgress('Rendering whiteboard canvas into PDF...');
    const bounds = computeObjectsBounds(objects, 40);
    const svgStr = generateSvgString(objects, { bounds, background: '#ffffff' });

    try {
      const imgData = await svgToImageDataUrl(svgStr, bounds.width, bounds.height, 2);

      const scale = Math.min(contentWidth / bounds.width, contentHeight / bounds.height);
      const drawW = bounds.width * scale;
      const drawH = bounds.height * scale;
      const drawX = margin + (contentWidth - drawW) / 2;
      const drawY = margin + headerHeight + (contentHeight - drawH) / 2;

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      pdf.text(boardName, margin, margin + 18);

      // Canvas Border
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(drawX, drawY, drawW, drawH, 'S');

      // Image
      pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH);

      // Footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      const dateStr = `Exported from Whiteboard • ${new Date().toLocaleDateString()}`;
      pdf.text(dateStr, margin, pageHeight - margin);
    } catch (err) {
      console.error('Error rendering board to PDF:', err);
    }
  }

  pdf.save(`${safeName}_presentation.pdf`);
}
