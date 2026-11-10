export type BoardObjectType =
  | 'sticky'
  | 'text'
  | 'rectangle'
  | 'rounded-rectangle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'hexagon'
  | 'bubble'
  | 'line'
  | 'arrow'
  | 'curved-arrow'
  | 'image'
  | 'drawing'
  | 'connector'
  | 'frame';

export type ShapeFillStyle = 'solid' | 'semi' | 'transparent' | 'hachure' | 'dots';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type ArrowHeadStyle = 'none' | 'arrow' | 'triangle' | 'circle' | 'diamond' | 'bar';

export interface Point {
  x: number;
  y: number;
}

export interface BaseBoardObject {
  id: string;
  boardId: string;
  type: BoardObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  opacity?: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface StickyObject extends BaseBoardObject {
  type: 'sticky';
  color: string;
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  link?: string;
}

export interface TextObject extends BaseBoardObject {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color: string;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right' | 'justify';
  link?: string;
}

export interface ShapeObject extends BaseBoardObject {
  type:
    | 'rectangle'
    | 'rounded-rectangle'
    | 'ellipse'
    | 'triangle'
    | 'diamond'
    | 'star'
    | 'hexagon'
    | 'bubble';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  borderRadius?: number;
  fillStyle?: ShapeFillStyle;
  strokeStyle?: StrokeStyle;
}

export interface LineObject extends BaseBoardObject {
  type: 'line' | 'arrow' | 'curved-arrow';
  strokeColor: string;
  strokeWidth: number;
  startArrow?: boolean;
  endArrow?: boolean;
  startArrowStyle?: ArrowHeadStyle;
  endArrowStyle?: ArrowHeadStyle;
  strokeStyle?: StrokeStyle;
  style?: 'straight' | 'curved';
  startPoint?: Point;
  endPoint?: Point;
  curvature?: number;
}

export interface DrawingObject extends BaseBoardObject {
  type: 'drawing';
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  penStyle?: 'pen' | 'highlighter' | 'marker' | 'dashed' | 'eraser' | 'smart';
  opacity?: number;
}

export type ConnectorAnchor = 'top' | 'right' | 'bottom' | 'left' | 'center';

export interface ConnectorObject extends BaseBoardObject {
  type: 'connector';
  fromObject?: string;
  fromAnchor?: ConnectorAnchor;
  fromPoint?: Point;
  toObject?: string;
  toAnchor?: ConnectorAnchor;
  toPoint?: Point;
  strokeColor: string;
  strokeWidth: number;
  style: 'straight' | 'elbow';
  startArrow?: boolean;
  endArrow?: boolean;
  startArrowStyle?: ArrowHeadStyle;
  endArrowStyle?: ArrowHeadStyle;
  strokeStyle?: StrokeStyle;
}

export interface ImageObject extends BaseBoardObject {
  type: 'image';
  src: string;
  aspectRatio: number;
  originalWidth: number;
  originalHeight: number;
}

export interface FrameObject extends BaseBoardObject {
  type: 'frame';
  title: string;
  fillColor: string;
  strokeColor: string;
  childIds: string[];
}

export type BoardObject =
  | StickyObject
  | TextObject
  | ShapeObject
  | LineObject
  | DrawingObject
  | ConnectorObject
  | ImageObject
  | FrameObject;
