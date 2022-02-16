/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
    // @ts-ignore
    window.URL.createObjectURL = () => {
        // Mock this function for mapbox-gl to work
    };
}
// Use minified bundle: https://github.com/plotly/react-plotly.js#customizing-the-plotlyjs-bundle
import Plotly from 'plotly.js-dist-min';
// Use your own `Plotly` object
import createPlotlyComponent from 'react-plotly.js/factory';
// tslint:disable-next-line:variable-name
export const PlotlyComponent = createPlotlyComponent(Plotly);
// Reexport plotly with proper typings, i.e. see tsd.d.ts
export { Plotly };
//# sourceMappingURL=Plot.js.map