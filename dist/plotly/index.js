/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
    // @ts-ignore
    window.URL.createObjectURL = () => {
        // Mock this function for mapbox-gl to work
    };
}
import * as React from 'react';
// Lazily load plotly.js-dist-min to allow code-splitting to occur, otherwise plotly is loaded everytime tdp_core is imported.
const LazyPlotlyComponent = React.lazy(() => Promise.all([import('plotly.js-dist-min'), import('react-plotly.js/factory')]).then(([plotly, createPlotlyComponent]) => ({
    // Use the minified version for our own `Plotly` object
    default: createPlotlyComponent.default(plotly),
})));
// The actually exported plotly component is wrapped in Suspense to allow lazy loading
export function PlotlyComponent(props) {
    return (React.createElement(React.Suspense, { fallback: null },
        React.createElement(LazyPlotlyComponent, { ...props })));
}
//# sourceMappingURL=index.js.map