export interface ILayoutElem {
    setBounds(x: number, y: number, w: number, h: number): Promise<void> | null;
    getBounds(): any;
    layoutOption<T>(name: string): T;
    layoutOption<T>(name: string, defaultValue: T): T;
}
export interface IPadding {
    readonly top: number;
    readonly left: number;
    readonly right: number;
    readonly bottom: number;
}
//# sourceMappingURL=layout.d.ts.map