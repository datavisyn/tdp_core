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
export class LineTickTrack extends ATrack {
    createLocation(item) {
        return `<div data-type='tick' style="border-left-color: ${item.color ? item.color : this.options.color}">${item.id}</div>`;
    }
    updateLocation(item, node, xScale) {
        const loc = xScale(item.location);
        node.style.transform = `translateX(${loc}px)`;
    }
}
//# sourceMappingURL=LineTickTrack.js.map