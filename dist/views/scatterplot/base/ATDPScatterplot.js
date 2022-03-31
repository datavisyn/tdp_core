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
import { AView } from '../../AView';
import { BaseUtils } from '../../../base/BaseUtils';
import { IDTypeManager } from '../../../idtype/IDTypeManager';
import { Scatterplot } from './Scatterplot';
export class ATDPScatterplot extends AView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.tracks = [];
        /*
         * Debouncing the render function to call the render method 200 milliseconds after the ViewWrapper calls the update method
         * Otherwise the canvas would render without width and height when resizing the views in dTiles, because it's set to display: none and therefore takes no space
         */
        this.update = BaseUtils.debounce(() => {
            this.plot.render();
            this.tracks.forEach((track) => {
                track.update(this.plot.window, this.plot.transformedScales().x);
            });
        }, 200);
        this.options = {
            itemIDType: null,
        };
        Object.assign(this.options, options);
        this.node.classList.add('tdp-scatterplot');
    }
    async buildPlot(props = {}, parent = this.node) {
        const data = await this.loadRows();
        const options = { ...this.getScatterplotOptions(), ...props };
        this.plot = new Scatterplot(data, parent, options);
        if (this.itemIDType) {
            this.plot.on(Scatterplot.EVENT_SELECTION_CHANGED, (instance) => {
                const selection = {
                    idtype: this.itemIDType,
                    ids: instance.selection.map((item) => item.id),
                };
                this.setItemSelection(selection);
            });
        }
        this.update();
        // add already pushed tracks, rest will register itself
        this.tracks.forEach((track) => {
            parent.insertAdjacentElement(track.position === 'beforePlot' ? 'afterbegin' : 'beforeend', track.node);
            this.plot.on(Scatterplot.EVENT_WINDOW_CHANGED, (window, scales) => {
                track.update(window, scales.x);
            });
        });
    }
    get itemIDType() {
        return this.options.itemIDType ? IDTypeManager.getInstance().resolveIdType(this.options.itemIDType) : null;
    }
    selectionChanged() {
        this.updateData();
    }
    async updateData() {
        this.plot.data = await this.loadRows(); // reload rows and set the data
    }
    pushTrack(track) {
        this.tracks.push(track);
        if (this.plot) {
            this.plot.node.parentElement.insertAdjacentElement(track.position === 'beforePlot' ? 'afterbegin' : 'beforeend', track.node);
            this.plot.on(Scatterplot.EVENT_WINDOW_CHANGED, (window, scales) => {
                track.update(window, scales.x);
            });
            track.update(this.plot.window, this.plot.transformedScales().x);
        }
    }
    clearTracks() {
        this.tracks.length = 0;
    }
}
//# sourceMappingURL=ATDPScatterplot.js.map