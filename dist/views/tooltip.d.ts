export declare class TooltipUtils {
    private static readonly template;
    private static findTooltip;
    private static showTooltipAt;
    static hideTooltip(): void;
    static showTooltip(html: string | HTMLElement | null, reference: HTMLElement | {
        x: number;
        y: number;
    }, simpleTooltip?: boolean): void | HTMLElement;
    private static isRelated;
    /**
     * similar to a tooltip but the hiding and showing will be done automatically
     * @param {string | null} html
     * @param {HTMLElement} reference
     * @param { number, number } coords
     */
    static popOver(html: string | HTMLElement | (() => string | HTMLElement), reference: HTMLElement, coords?: {
        x: number;
        y: number;
    }, simpleTooltip?: boolean): void;
    /**
     * similar to a tooltip but the hiding and showing will be done automatically
     * @param {(items: T[]) => string} contentGenerator
     */
    static generateTooltip<T>(contentGenerator: (items: T[]) => string | HTMLElement, simpleTooltip?: boolean): (parent: HTMLElement, items: T[], x: number, y: number, event: MouseEvent) => void;
}
//# sourceMappingURL=tooltip.d.ts.map