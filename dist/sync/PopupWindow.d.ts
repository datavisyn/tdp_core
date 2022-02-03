export interface INodeVis {
    node: Element;
    destroy?(): any;
}
export interface IPopupProxyOptions {
    args?: any[];
    name?: string;
}
export declare class PopupProxy<T extends INodeVis> {
    private readonly parent;
    private readonly factory;
    private current;
    private popup;
    private options;
    private handler;
    constructor(parent: HTMLElement, factory: (parent: HTMLElement, ...args: any[]) => T, options?: IPopupProxyOptions);
    private build;
    private buildPopup;
    get proxy(): T;
    close(): void;
    open(): void;
}
//# sourceMappingURL=PopupWindow.d.ts.map