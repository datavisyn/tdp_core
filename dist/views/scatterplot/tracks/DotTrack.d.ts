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
import { ATrack, ITrackOptions } from './ATrack';
export interface IDotElement {
    location: number;
}
export declare class DotTrack extends ATrack<IDotElement> {
    constructor(data: IDotElement[], options?: Partial<ITrackOptions>);
    protected createLocation(item: IDotElement): string;
    protected updateLocation(item: IDotElement, node: HTMLElement, xScale: (v: number) => number): void;
}
//# sourceMappingURL=DotTrack.d.ts.map