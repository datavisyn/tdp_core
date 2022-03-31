/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { IWindow } from '../base/AScatterplot';
export interface ITrackOptions {
    margin: {
        left: number;
        right: number;
    };
    /**
     * insert the track before or after the scatterplot
     */
    position: 'beforePlot' | 'afterPlot';
    color: string;
    useTooltip: boolean;
    showTrackLine: boolean;
    backgroundColor: string;
    title: string;
    /**
     * start and end are used to compute a width for the track and translating it to the correct position
     * instead of using the full width of the scatterplot
     */
    start?: number;
    end?: number;
}
export declare abstract class ATrack<T> {
    protected data: T[];
    protected readonly options: Readonly<ITrackOptions>;
    readonly node: HTMLElement;
    private xScale;
    private window;
    constructor(data: T[], options?: Partial<ITrackOptions>);
    get position(): 'beforePlot' | 'afterPlot';
    setData(data: T[]): void;
    private initDOM;
    protected showTooltip(parent: HTMLElement, item: T, element: HTMLElement, x: number, y: number): void;
    protected hideTooltip(parent: HTMLElement): void;
    /**
     * Update the track (e.g. when the corresponding chart is panned or zoomed
     * @param {IWindow} window
     * @param {(x: number) => number} xScale
     */
    update(window: IWindow, xScale: (x: number) => number): void;
    private updateTrack;
    protected abstract createLocation(item: T): any;
    protected abstract updateLocation(item: T, node: HTMLElement, xScale: (x: number) => number, window: IWindow): any;
}
//# sourceMappingURL=ATrack.d.ts.map