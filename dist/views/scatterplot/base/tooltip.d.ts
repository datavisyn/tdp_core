/**
 * Created by sam on 28.10.2016.
 */
/// <reference types="react" />
export declare class ScatterplotTooltipUtils {
    static readonly template: string;
    static findTooltip(parent: HTMLElement, ensureExists?: boolean): HTMLElement;
    static showTooltipAt(tooltip: HTMLElement, x: number, y: number): void;
    static toString(d: any): any;
    /**
     * @internal
     */
    static showTooltip(parent: HTMLElement, items: any[], x: number, y: number): void;
}
//# sourceMappingURL=tooltip.d.ts.map