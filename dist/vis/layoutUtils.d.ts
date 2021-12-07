import { PlotlyInfo } from './interfaces';
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: any): any;
