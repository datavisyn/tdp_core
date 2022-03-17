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
import { BaseUtils } from '../../../base/BaseUtils';
export class ATrack {
    constructor(data, options = {}) {
        this.data = data;
        this.options = {
            margin: {
                left: 48,
                right: 10,
            },
            position: 'afterPlot',
            color: '#F4999A',
            useTooltip: true,
            showTrackLine: false,
            backgroundColor: '',
            title: '',
        };
        BaseUtils.mixin(this.options, options);
        this.node = document.createElement('div');
        this.node.classList.add('track');
        this.node.style.marginLeft = `${this.options.margin.left}px`;
        this.node.style.marginRight = `${this.options.margin.right}px`;
        this.node.insertAdjacentHTML('afterbegin', `
      ${this.options.title ? `<header>${this.options.title}</header>` : ''}
      <div class="track-content"></div>
    `);
        if (this.options.showTrackLine) {
            this.node.classList.add('track-line');
        }
        this.node.style.backgroundColor = this.options.backgroundColor;
        this.initDOM();
    }
    get position() {
        return this.options.position;
    }
    setData(data) {
        this.data = data;
        this.initDOM();
        this.update(this.window, this.xScale);
    }
    initDOM() {
        const trackContent = this.node.querySelector('div.track-content');
        trackContent.innerHTML = '';
        const elements = this.data.map((item) => this.createLocation(item)).join('');
        trackContent.insertAdjacentHTML('beforeend', elements);
        if (this.options.useTooltip) {
            Array.from(trackContent.children).forEach((element, i) => {
                element.addEventListener('mouseover', (e) => {
                    const item = this.data[i];
                    this.showTooltip(this.node.parentElement, item, element, e.x, e.y);
                });
                element.addEventListener('mouseleave', () => {
                    this.hideTooltip(this.node.parentElement);
                });
            });
        }
    }
    showTooltip(parent, item, element, x, y) {
        parent.insertAdjacentHTML('beforeend', `
          <div class="track-tooltip"">
              ${Object.keys(item)
            .map((key) => `<p>${key}: ${item[key]}</p>`)
            .join('')}
          </div>
        `);
        const tooltip = parent.querySelector('.track-tooltip');
        const boundingRect = tooltip.getBoundingClientRect();
        tooltip.style.left = `${x - boundingRect.width / 2}px`;
        tooltip.style.top = `${element.getBoundingClientRect().top - parent.getBoundingClientRect().top - boundingRect.height - 5}px`;
        // set tooltip visible after setting the top position, otherwise the height of the tooltip correct height cannot be queried
        // a tooltip set to display: none would have no height
        tooltip.style.visibility = 'visible';
    }
    hideTooltip(parent) {
        const tooltip = parent.querySelector('.track-tooltip');
        if (tooltip != null) {
            tooltip.remove();
        }
    }
    /**
     * Update the track (e.g. when the corresponding chart is panned or zoomed
     * @param {IWindow} window
     * @param {(x: number) => number} xScale
     */
    update(window, xScale) {
        this.window = window;
        this.xScale = xScale;
        if (this.options.start && this.options.end) {
            this.updateTrack(xScale);
        }
        Array.from(this.node.querySelector('div.track-content').children).forEach((elem, i) => {
            this.updateLocation(this.data[i], elem, xScale, window);
        });
    }
    updateTrack(xScale) {
        const track = this.node;
        track.style.width = `${Math.max(xScale(this.options.end) - xScale(this.options.start), 1)}px`;
        track.style.transform = `translateX(${xScale(this.options.start)}px)`;
    }
}
//# sourceMappingURL=ATrack.js.map