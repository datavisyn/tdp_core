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
/// <reference types="react" />
import { ATrack } from './ATrack';
export interface IBoxTrackElement {
    id: string;
    start: number;
    end: number;
    color?: string;
}
export declare class BoxTrack extends ATrack<IBoxTrackElement> {
    protected createLocation(item: IBoxTrackElement): string;
    protected updateLocation(item: IBoxTrackElement, node: HTMLElement, xScale: (v: number) => number): void;
}
//# sourceMappingURL=BoxTrack.d.ts.map