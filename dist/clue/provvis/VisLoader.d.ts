import { ProvenanceGraph } from '../provenance';
import { LayoutedProvVis } from './provvis';
import { VerticalStoryVis } from './storyvis';
export declare class VisLoader {
    static loadProvenanceGraphVis(data: Promise<ProvenanceGraph>, parent: Element, options?: {}): () => Promise<LayoutedProvVis>;
    static loadStoryVis(graph: Promise<ProvenanceGraph>, parent: HTMLElement, main: HTMLElement, options: {
        thumbnails: boolean;
    }): () => Promise<VerticalStoryVis>;
}
//# sourceMappingURL=VisLoader.d.ts.map