import * as React from 'react';
export function createProxyView() {
    return {
        viewType: 'simple',
        defaultParameters: { currentId: '' },
        view: React.lazy(() => import(/* webpackChunkName: "VisynDemoView" */ './VisynProxyView').then((m) => ({ default: m.ProxyView }))),
        header: React.lazy(() => import(/* webpackChunkName: "VisynDemoViewHeader" */ './VisynProxyView').then((m) => ({ default: m.ProxyViewHeader }))),
        tab: null,
    };
}
//# sourceMappingURL=LazyVisynProxyView.js.map