import { ProvenanceGraph } from '../provenance';
import { LayoutedProvVis } from './provvis';
import { VerticalStoryVis } from './storyvis';

export class VisLoader {
  static loadProvenanceGraphVis(data: Promise<ProvenanceGraph>, parent: Element, options = {}): () => Promise<LayoutedProvVis> {
    parent.insertAdjacentHTML('beforeend', `<aside class="provenance-sidepanel provenance-layout-vis"></aside>`);
    let c: Promise<LayoutedProvVis>;
    return () => {
      if (!c) {
        c = Promise.all([<any>data, import('./provvis.js')]).then((args) => args[1].LayoutedProvVis.createLayoutedProvVis(args[0], parent, options));
      }
      return c;
    };
  }

  static loadStoryVis(
    graph: Promise<ProvenanceGraph>,
    parent: HTMLElement,
    main: HTMLElement,
    options: { thumbnails: boolean },
  ): () => Promise<VerticalStoryVis> {
    parent.insertAdjacentHTML('beforeend', `<aside class="provenance-sidepanel provenance-story-vis"></aside>`);
    let c: Promise<VerticalStoryVis>;
    return () => {
      if (!c) {
        c = Promise.all([<any>graph, import('./storyvis.js')]).then((args) => args[1].VerticalStoryVis.createStoryVis(args[0], parent, main, options));
      }
      return c;
    };
  }
}
