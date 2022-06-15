import { GraphNode } from '../graph/graph';
import { StateNode } from './StateNode';
export interface IStateAnnotation {
    readonly type: string;
    pos: [number, number] | {
        anchor: string;
        offset: [number, number];
    };
    readonly styles?: {
        [key: string]: string;
    };
    readonly [key: string]: any;
}
export interface ITextStateAnnotation extends IStateAnnotation {
    text: string;
    size?: [number, number];
    rotation?: number;
}
export interface IArrowStateAnnotation extends IStateAnnotation {
    at: [number, number];
}
export interface IFrameStateAnnotation extends IStateAnnotation {
    size?: [number, number];
    pos2?: [number, number];
    rotation?: number;
}
export declare class SlideNode extends GraphNode {
    static DEFAULT_DURATION: number;
    static DEFAULT_TRANSITION: number;
    constructor();
    get name(): string;
    set name(value: string);
    get description(): string;
    set description(value: string);
    get isTextOnly(): boolean;
    get state(): StateNode;
    static restore(dump: any): SlideNode;
    get next(): SlideNode;
    get nexts(): SlideNode[];
    get previous(): SlideNode;
    get slideIndex(): number;
    get duration(): number;
    set duration(value: number);
    /**
     * the number of milliseconds for the transitions
     * @returns {number}
     */
    get transition(): number;
    set transition(value: number);
    get annotations(): IStateAnnotation[];
    setAnnotation(index: number, ann: IStateAnnotation): void;
    updateAnnotation(ann: IStateAnnotation): void;
    removeAnnotation(index: number): void;
    removeAnnotationElem(elem: IStateAnnotation): void;
    pushAnnotation(ann: IStateAnnotation): void;
    get isStart(): boolean;
    static makeText(title?: string): SlideNode;
    static toSlidePath(s?: SlideNode): SlideNode[];
}
//# sourceMappingURL=SlideNode.d.ts.map