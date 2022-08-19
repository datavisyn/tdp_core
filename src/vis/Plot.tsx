/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
  // @ts-ignore
  window.URL.createObjectURL = () => {
    // Mock this function for mapbox-gl to work
  };
}

// Use minified bundle: https://github.com/plotly/react-plotly.js#customizing-the-plotlyjs-bundle
import * as React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { PlotParams } from 'react-plotly.js';

// Use the minified version for our own `Plotly` object
export const PlotlyComponent: React.ComponentType<PlotParams> = createPlotlyComponent(Plotly);

// Reexport the minified plotly with proper typings
export { Plotly };
