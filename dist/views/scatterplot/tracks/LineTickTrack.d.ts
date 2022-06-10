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
export interface ILineTickTrack {
    id: string;
    location: number;
    color?: string;
}
export declare class LineTickTrack extends ATrack<ILineTickTrack> {
    protected createLocation(item: ILineTickTrack): string;
    protected updateLocation(item: ILineTickTrack, node: HTMLElement, xScale: (v: number) => number): void;
}
//# sourceMappingURL=LineTickTrack.d.ts.map