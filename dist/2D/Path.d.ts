import { IPathSegment } from './PathSegment';
export declare class Path {
    static COMMAND: number;
    static NUMBER: number;
    static EOD: number;
    static PARAMS: {
        [key: string]: string[];
    };
    segments: IPathSegment[];
    constructor(path: string);
    appendPathSegment(segment: IPathSegment): void;
    parseData(d: string): void;
    tokenize(d: string): any[];
    asIntersectionParams(): import("./IIntersectionParam").IIntersectionParam;
}
