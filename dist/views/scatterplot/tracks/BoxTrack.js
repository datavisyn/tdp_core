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
export class BoxTrack extends ATrack {
    createLocation(item) {
        return `<div style="background-color: ${item.color ? item.color : this.options.color}" title="${item.id}">${item.id}</div>`;
    }
    updateLocation(item, node, xScale) {
        const startPixelPosition = xScale(item.start);
        const endPixelPosition = xScale(item.end);
        const width = Math.max(endPixelPosition - startPixelPosition, 1);
        node.style.transform = `translateX(${startPixelPosition}px)`;
        node.style.width = `${width}px`;
    }
}
//# sourceMappingURL=BoxTrack.js.map