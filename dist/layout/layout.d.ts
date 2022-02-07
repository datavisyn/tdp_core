import { Rect } from '../geom';
export interface ILayoutElem {
    setBounds(x: number, y: number, w: number, h: number): Promise<void> | null;
    getBounds(): Rect;
    layoutOption<T>(name: string): T;
    layoutOption<T>(name: string, defaultValue: T): T;
}
export interface ILayoutOptions {
    /**
     * preferred x position
     * default NaN
     */
    prefX?: number;
    /**
     * preferred y position
     * default NaN
     */
    prefY?: number;
    /**
     * preferred width
     * default NaN
     */
    prefWidth?: number;
    /**
     * preferred height
     * default NaN
     */
    prefHeight?: number;
    /**
     * border attachment for BorderLayout, possible values: center, top, left, right, bottom
     * default: center
     */
    border?: string;
}
export declare class ALayoutElem {
    private options;
    constructor(options?: ILayoutOptions);
    getBounds(): Rect;
    getLocation(): import("..").Vector2D;
    getSize(): import("..").Vector2D;
    layoutOption<T>(name: string, defaultValue?: T): T;
}
export interface IHTMLLayoutOptions extends ILayoutOptions {
    unit?: string;
}
export interface IPadding {
    readonly top: number;
    readonly left: number;
    readonly right: number;
    readonly bottom: number;
}
export interface ILayout {
    (elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem): Promise<boolean>;
}
//# sourceMappingURL=layout.d.ts.map