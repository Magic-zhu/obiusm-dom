export interface Action {
    type: string;
    children?: Action[];
    action?: string;
    transformOrigin?: string;
    parent: Action | ActionTree | null;
    time?: number;
    duration?: number;
    timeFunction?: string;
    status?:StatusDescription;
}

export interface ActionTree {
    parent: ActionTree | null
    children: Action[] | null
}
export interface StyleObject {
    duration: number,
    style:Object,
    status?:string
}

export interface TranslateOptions {
    x?: number | string;
    y?: number | string;
    z?: number | string;
    duration?: number;
    timeFunction?: string;
}

export interface ScaleOptions {
    x?: number | string;
    y?: number | string;
    z?: number | string;
    duration?: number;
    timeFunction?: string;
    transformOrigin?:string;
}

export interface RotateOptions {
    angle: number | string;
    x?: number | string;
    y?: number | string;
    z?: number | string;
    duration?: number;
    timeFunction?: string;
    transformOrigin?:string;
}

export interface MoveOptions {
    x?: number | string;
    y?: number | string;
    duration?: number;
    timeFunction?: string;
}

export interface AttributeOptions {
    key: string;
    value: any;
    duration?: number;
    timeFunction?: string;
}

export interface StatusDescription {
    type:string,
    description?:string,
    transformOrigin:string,
}
