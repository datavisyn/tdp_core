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
import * as React from 'react';
import { AReactView } from './AReactView';
/**
 * a view that wrapy any React element having @see IWrappedProps as properties
 */
export class ReactViewWrapper extends AReactView {
    get desc() {
        return this.context.desc;
    }
    initImpl() {
        this.desc.component().then((r) => {
            this.impl = r;
            this.forceUpdate();
        });
        return super.initImpl();
    }
    getItemType() {
        return this.context.desc.itemIDType || null;
    }
    render(inputSelection, itemSelection, itemSelector) {
        if (!this.impl) {
            return React.createElement("div", null, "Loading...");
        }
        return React.createElement(this.impl.default, { inputSelection, itemSelection, itemSelector });
    }
}
//# sourceMappingURL=ReactViewWrapper.js.map