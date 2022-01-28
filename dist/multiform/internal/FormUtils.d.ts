import { IVisPluginDesc } from '../../vis/IVisPluginDesc';
export declare class FormUtils {
    /**
     * @internal
     */
    static selectVis(initial: number | string | IVisPluginDesc, visses: IVisPluginDesc[]): IVisPluginDesc;
    /**
     * @internal
     */
    static clearNode(parent: Element): void;
    /**
     * @internal
     */
    static createNode(parent: HTMLElement, type?: string, clazz?: string): HTMLElement;
}
//# sourceMappingURL=FormUtils.d.ts.map