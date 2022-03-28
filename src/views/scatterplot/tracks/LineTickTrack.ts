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

import { ATrack } from './ATrack';

export interface ILineTickTrack {
  id: string;
  location: number;
  color?: string;
}

export class LineTickTrack extends ATrack<ILineTickTrack> {
  protected createLocation(item: ILineTickTrack) {
    return `<div data-type='tick' style="border-left-color: ${item.color ? item.color : this.options.color}">${item.id}</div>`;
  }

  protected updateLocation(item: ILineTickTrack, node: HTMLElement, xScale: (v: number) => number) {
    const loc = xScale(item.location);

    node.style.transform = `translateX(${loc}px)`;
  }
}
