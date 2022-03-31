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

export class DotTrack extends ATrack<IDotElement> {
  constructor(data: IDotElement[], options: Partial<ITrackOptions> = {}) {
    super(data, {
      useTooltip: false,
      ...options,
    });
  }

  protected createLocation(item: IDotElement) {
    return `<div data-type='dot' style="background-color: ${this.options.color}"></div>`;
  }

  protected updateLocation(item: IDotElement, node: HTMLElement, xScale: (v: number) => number) {
    const loc = xScale(item.location);

    node.style.transform = `translateX(${loc}px)`;
  }
}
