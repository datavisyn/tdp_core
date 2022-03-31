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
export class DotTrack extends ATrack {
    constructor(data, options = {}) {
        super(data, {
            useTooltip: false,
            ...options,
        });
    }
    createLocation(item) {
        return `<div data-type='dot' style="background-color: ${this.options.color}"></div>`;
    }
    updateLocation(item, node, xScale) {
        const loc = xScale(item.location);
        node.style.transform = `translateX(${loc}px)`;
    }
}
//# sourceMappingURL=DotTrack.js.map