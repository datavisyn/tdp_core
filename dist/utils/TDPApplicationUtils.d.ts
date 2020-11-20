import { ISecureItem, IObjectRef, ProvenanceGraph, ActionNode } from 'phovea_core';
export interface IPermissionFormOptions {
    /**
     * extra html
     */
    extra: string;
    doc: Document;
}
export interface IParameterAble {
    getParameter(name: string): any;
    setParameterImpl(name: string, value: any): any;
}
export declare class TDPApplicationUtils {
    static readonly MIN = 60;
    static readonly HOUR: number;
    static readonly DAY: number;
    static readonly CMD_INIT_SESSION = "tdpInitSession";
    static readonly CMD_SET_PARAMETER = "tdpSetParameter";
    static readonly getAreas: () => [number, string | ((d: number) => string)][];
    /**
     * see http://momentjs.com/docs/#/displaying/fromnow/
     * @param {Date} date
     */
    static fromNow(date: Date | number): string;
    static notAllowedText(notAllowed: boolean | string): string;
    /**
     * utilitly for adding a permission form as used in TDP by default
     * @param item
     */
    static permissionForm(item?: ISecureItem, options?: Partial<IPermissionFormOptions>): {
        node: HTMLDivElement;
        resolve: (data: FormData) => Partial<ISecureItem>;
    };
    static initSessionImpl(_inputs: IObjectRef<any>[], parameters: object): {
        inverse: import("phovea_core").IAction;
    };
    static initSession(map: object): import("phovea_core").IAction;
    static setParameterImpl(inputs: IObjectRef<any>[], parameter: any, graph: ProvenanceGraph): Promise<{
        inverse: import("phovea_core").IAction;
    }>;
    static setParameter(view: IObjectRef<IParameterAble>, name: string, value: any, previousValue: any): import("phovea_core").IAction;
    static compressSetParameter(path: ActionNode[]): ActionNode[];
    /**
     * @deprecated
     */
    static compressSetParameterOld(path: ActionNode[]): ActionNode[];
}
