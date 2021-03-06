import { Action, StyleObject, AttributeOptions, RotateOptions, ScaleOptions } from './@types';
declare class DomRender {
    static pluginName: string;
    static installed: boolean;
    static mot: any;
    target: HTMLElement;
    Animation: any;
    taskQueue: any[];
    originTransform: any[];
    originTransitionProperty: string[];
    timeLine: any[];
    tempQueue: Object[];
    constructor(dom: HTMLElement, Animation: any);
    static install(mot: any): void;
    init(): void;
    update(transform: string | null, transitionProperty: string | null): void;
    getOriginStyleTransform(element: HTMLElement): any[];
    initStyle(taskQueue: Action[]): void;
    render(): void;
    renderStatusOn(item: Action): void;
    renderStatusOff(item: Action): void;
    mergeTransForm(origin: any[], newStyle: string): string;
    mergeTransitionProperty(origin: string[], newProperty: string): string;
    getStyleFromTaskQueue(taskQueue: any[]): StyleObject[];
    transferAction(item: Action): any;
    translate(params: any): {
        transform: string;
        transitionDuration: string;
        transitionTimingFunction: string;
        transitionProperty: string;
    };
    move(params: any): {
        left: string;
        top: string;
        transitionDuration: string;
        transitionTimingFunction: string;
        transitionProperty: string;
    };
    scale(params: ScaleOptions): {
        transform: string;
        transitionDuration: string;
        transitionTimingFunction: string;
        transitionProperty: string;
        transformOrigin: string;
    };
    rotate(params: RotateOptions): {
        transform: string;
        transformOrigin: string;
        transitionDuration: string;
        transitionTimingFunction: string;
        transitionProperty: string;
    };
    attribute(params: AttributeOptions): {
        [x: string]: any;
        transitionDuration: string;
        transitionTimingFunction: string;
        transitionProperty: string;
    };
    humpParse(s: string): string;
    splitStyleToArray(styleString: string): any[];
    splitTransitionPropertyToArray(property: string): string[];
    addStylesheetRules(decls: any): void;
    insertKeyFrame(keyframe: string): void;
    addClassName(dom: HTMLElement, className: string): void;
    removeClassName(dom: HTMLElement, className: string): void;
}
export default DomRender;
