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
    private static readonly MIN;
    private static readonly HOUR;
    private static readonly DAY;
    private static readonly CMD_INIT_SESSION;
    private static readonly CMD_SET_PARAMETER;
    private static readonly getAreas;
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
}
