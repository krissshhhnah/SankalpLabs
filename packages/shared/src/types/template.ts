import { BoardObject } from './object';

export interface BoardTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  badge?: string;
  objects: any[];
}
