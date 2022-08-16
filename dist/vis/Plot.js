/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
    // @ts-ignore
    window.URL.createObjectURL = () => {
        // Mock this function for mapbox-gl to work
    };
}
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
// Use the minified version for our own `Plotly` object
export const PlotlyComponent = createPlotlyComponent(Plotly);
// Reexport the minified plotly with proper typings
export { Plotly };
//# sourceMappingURL=Plot.js.map