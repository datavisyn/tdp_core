/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
  // @ts-ignore
  window.URL.createObjectURL = () => {
    // Mock this function for mapbox-gl to work
  };
}

import * as React from 'react';
import type { PlotParams } from 'react-plotly.js';
import type { Plotly as PlotlyTypes } from './full';

// Lazily load plotly.js-dist-min to allow code-splitting to occur, otherwise plotly is loaded everytime tdp_core is imported.
const LazyPlotlyComponent = React.lazy(() =>
  Promise.all([import('plotly.js-dist-min'), import('react-plotly.js/factory')]).then(([plotly, createPlotlyComponent]) => ({
    // Use the minified version for our own `Plotly` object
    default: createPlotlyComponent.default(plotly),
  })),
);

// The actually exported plotly component is wrapped in Suspense to allow lazy loading
export function PlotlyComponent(props: PlotParams) {
  return (
    <React.Suspense fallback={null}>
      <LazyPlotlyComponent {...props} />
    </React.Suspense>
  );
}

// Reexport only the plotly typings
export { PlotlyTypes };
