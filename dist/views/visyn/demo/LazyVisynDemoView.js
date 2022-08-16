import * as React from 'react';
export function createLazyVisynDemoView() {
    return {
        viewType: 'simple',
        defaultParameters: {
            columns: null,
            config: null,
            dataLength: 100,
        },
        view: React.lazy(() => import(/* webpackChunkName: "VisynDemoView" */ './VisynDemoView').then((m) => ({ default: m.VisynDemoView }))),
        header: React.lazy(() => import(/* webpackChunkName: "VisynDemoViewHeader" */ './VisynDemoView').then((m) => ({ default: m.VisynDemoViewHeader }))),
        tab: React.lazy(() => import(/* webpackChunkName: "VisynDemoViewSidebar" */ './VisynDemoView').then((m) => ({ default: m.VisynDemoViewSidebar }))),
    };
}
//# sourceMappingURL=LazyVisynDemoView.js.map