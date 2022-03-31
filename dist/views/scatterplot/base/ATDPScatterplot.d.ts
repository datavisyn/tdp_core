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
import { IDTypeLike } from '../../../idtype/IDType';
import { IRow } from '../../../base/rest';
import { AView } from '../../AView';
import { ISelection, IViewContext } from '../../../base/interfaces';
import { IScatterplotOptions } from './AScatterplot';
import { Scatterplot } from './Scatterplot';
import { ATrack } from '../tracks/ATrack';
export interface IAScatterplotOptions {
    itemIDType: IDTypeLike | string;
}
export declare abstract class ATDPScatterplot<T extends IRow> extends AView {
    protected plot: Scatterplot<T>;
    private readonly tracks;
    readonly update: (...args: any[]) => void;
    private options;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IAScatterplotOptions>);
    protected buildPlot(props?: Partial<IScatterplotOptions<T>>, parent?: HTMLElement): Promise<void>;
    get itemIDType(): import("../../../idtype/IDType").IDType;
    protected selectionChanged(): void;
    updateData(): Promise<void>;
    pushTrack(track: ATrack<any>): void;
    clearTracks(): void;
    /**
     * Override this method to return the dataset
     * @returns {Promise<T> | T}
     */
    protected abstract loadRows(): Promise<T[]> | T[];
    /**
     * Override this method to return options for the scatterplot, like minima and maxima for the x and y axes, data accessors, etc.
     * @returns {IScatterplotOptions<T>}
     */
    protected abstract getScatterplotOptions(): Partial<IScatterplotOptions<T>>;
}
//# sourceMappingURL=ATDPScatterplot.d.ts.map