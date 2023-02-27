import * as React from 'react';
const VisLazy = React.lazy(() => import('./Vis').then((m) => ({ default: m.EagerVis })));
export function Vis(props) {
    return (React.createElement(React.Suspense, { fallback: null },
        React.createElement(VisLazy, { ...props })));
}
//# sourceMappingURL=LazyVis.js.map