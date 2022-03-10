import * as React from 'react';
export function createLazyVisynDemoView() {
    return {
        viewType: 'simple',
        defaultParameters: {
            columns: null,
            dataLength: 100,
        },
        view: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoView }))),
        header: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewHeader }))),
        tab: React.lazy(() => import('./VisynDemoView').then((m) => ({ default: m.VisynDemoViewSidebar }))),
    };
}
//# sourceMappingURL=index.js.map