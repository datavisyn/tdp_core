export class VisLoader {
    static loadProvenanceGraphVis(data, parent, options = {}) {
        parent.insertAdjacentHTML('beforeend', `<aside class="provenance-sidepanel provenance-layout-vis"></aside>`);
        let c;
        return () => {
            if (!c) {
                c = Promise.all([data, import('./provvis')]).then((args) => args[1].LayoutedProvVis.createLayoutedProvVis(args[0], parent, options));
            }
            return c;
        };
    }
    static loadStoryVis(graph, parent, main, options) {
        parent.insertAdjacentHTML('beforeend', `<aside class="provenance-sidepanel provenance-story-vis"></aside>`);
        let c;
        return () => {
            if (!c) {
                c = Promise.all([graph, import('./storyvis')]).then((args) => args[1].VerticalStoryVis.createStoryVis(args[0], parent, main, options));
            }
            return c;
        };
    }
}
//# sourceMappingURL=VisLoader.js.map