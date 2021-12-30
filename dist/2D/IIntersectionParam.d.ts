export interface IIntersectionParam {
    readonly name: string;
    readonly params: any[];
}
export declare class IntersectionParamUtils {
    static createIntersectionParam(name: string, params: any[]): IIntersectionParam;
}
