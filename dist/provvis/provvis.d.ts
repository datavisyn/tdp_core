import '../webpack/_bootstrap';
import { ProvenanceGraph } from '../provenance';
import { AVisInstance, IVisInstance } from './visInstance';
import { Range } from '../range';
export declare class LayoutedProvVis extends AVisInstance implements IVisInstance {
    data: ProvenanceGraph;
    parent: Element;
    private options;
    private $node;
    private trigger;
    private triggerStoryHighlight;
    private onStateAdded;
    private onSelectionChanged;
    private line;
    private dim;
    private highlight;
    constructor(data: ProvenanceGraph, parent: Element, options: any);
    private bind;
    private unbind;
    private toggleBinding;
    destroy(): void;
    get rawSize(): [number, number];
    get node(): Element;
    option(name: string, val?: any): any;
    locateImpl(range: Range): Promise<any>;
    private build;
    private onStateClick;
    update(): void;
    private updateStoryHighlight;
    static createLayoutedProvVis(data: ProvenanceGraph, parent: Element, options?: {}): LayoutedProvVis;
}
//# sourceMappingURL=provvis.d.ts.map