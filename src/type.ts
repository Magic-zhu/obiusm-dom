export interface Action {
  type: string;
  children?: Action[];
  action?: string;
  transformOrigin?: string;
  parent: Action | ActionTree | null;
  time?: number;
  duration?: number;
  /**
   * 时间函数
   */
  timeFunction?: string;
  status?: StatusDescription;
}

export interface ActionTree {
  parent: ActionTree | null;
  children: Action[] | null;
}
export interface StyleObject {
  duration: number;
  style: Object;
  status?: string;
  type: string;
}

export interface TranslateOptions {
  x?: number | string;
  y?: number | string;
  z?: number | string;
  duration?: number;
  timeFunction?: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface ScaleOptions {
  x?: number | string;
  y?: number | string;
  z?: number | string;
  duration?: number;
  timeFunction?: string;
  transformOrigin?: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface RotateOptions {
  angle: number | string;
  x?: number | string;
  y?: number | string;
  z?: number | string;
  duration?: number;
  timeFunction?: string;
  transformOrigin?: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface MoveOptions {
  x?: number | string;
  y?: number | string;
  duration?: number;
  timeFunction?: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface AttributeOptions {
  key: string;
  value: any;
  duration?: number;
  timeFunction?: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface KeyframeAction {
  [key: string]: string;
}

export interface KeyframeOptions {
  id: string;
  keyframe: any[];
  uid: string;
  duration?: number;
  timeFunction?: string;
  fillMode?: string;
  delay: number;
  iterationCount: string;
  direction: string;
  playState: string;
  onBengin?: Function;
  onFinish?: Function;
}

export interface KeyframeItem {
  process: string;
  action: KeyframeAction;
}

export type Keyframe = KeyframeItem[];

export interface CommonObject {
  [key: string]: any;
}

export enum TaskProcessType {
  'KEYFRAME' = 'keyframe',
  'MOVE' = 'move',
  'ROTATE' = 'rotate',
  'TRANSLATE' = 'translate',
  'ATTRIBUTE' = 'attribute',
  'WAIT' = 'wait',
  'STOP' = 'stop',
}

export enum ProcessStatus {
  'STOP' = 0,
  'PLAYING' = 1,
  'PAUSE' = 2,
}
