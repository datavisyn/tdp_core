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

import { merge } from 'lodash';
import { IWindow } from '../base/AScatterplot';

export interface ITrackOptions {
  margin: {
    left: number;
    right: number;
  };

  /**
   * insert the track before or after the scatterplot
   */
  position: 'beforePlot' | 'afterPlot';
  color: string;
  useTooltip: boolean;
  showTrackLine: boolean;
  backgroundColor: string;
  title: string;

  /**
   * start and end are used to compute a width for the track and translating it to the correct position
   * instead of using the full width of the scatterplot
   */
  start?: number;
  end?: number;
}

export abstract class ATrack<T> {
  protected readonly options: Readonly<ITrackOptions> = {
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

  readonly node: HTMLElement;

  private xScale: (x: number) => number;

  private window: IWindow;

  constructor(protected data: T[], options: Partial<ITrackOptions> = {}) {
    merge(this.options, options);

    this.node = document.createElement('div');
    this.node.classList.add('track');
    this.node.style.marginLeft = `${this.options.margin.left}px`;
    this.node.style.marginRight = `${this.options.margin.right}px`;

    this.node.insertAdjacentHTML(
      'afterbegin',
      `
      ${this.options.title ? `<header>${this.options.title}</header>` : ''}
      <div class="track-content"></div>
    `,
    );

    if (this.options.showTrackLine) {
      this.node.classList.add('track-line');
    }

    this.node.style.backgroundColor = this.options.backgroundColor;

    this.initDOM();
  }

  get position(): 'beforePlot' | 'afterPlot' {
    return this.options.position;
  }

  setData(data: T[]) {
    this.data = data;
    this.initDOM();
    this.update(this.window, this.xScale);
  }

  private initDOM() {
    const trackContent = this.node.querySelector('div.track-content');
    trackContent.innerHTML = '';

    const elements = this.data.map((item: T) => this.createLocation(item)).join('');

    trackContent.insertAdjacentHTML('beforeend', elements);

    if (this.options.useTooltip) {
      Array.from(trackContent.children).forEach((element: HTMLElement, i) => {
        element.addEventListener('mouseover', (e) => {
          const item = this.data[i];
          this.showTooltip(this.node.parentElement!, item, element, e.x, e.y);
        });
        element.addEventListener('mouseleave', () => {
          this.hideTooltip(this.node.parentElement!);
        });
      });
    }
  }

  protected showTooltip(parent: HTMLElement, item: T, element: HTMLElement, x: number, y: number) {
    parent.insertAdjacentHTML(
      'beforeend',
      `
          <div class="track-tooltip"">
              ${Object.keys(item)
                .map((key) => `<p>${key}: ${item[key]}</p>`)
                .join('')}
          </div>
        `,
    );

    const tooltip = <HTMLElement>parent.querySelector('.track-tooltip');

    const boundingRect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${x - boundingRect.width / 2}px`;
    tooltip.style.top = `${element.getBoundingClientRect().top - parent.getBoundingClientRect().top - boundingRect.height - 5}px`;
    // set tooltip visible after setting the top position, otherwise the height of the tooltip correct height cannot be queried
    // a tooltip set to display: none would have no height
    tooltip.style.visibility = 'visible';
  }

  protected hideTooltip(parent: HTMLElement) {
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
  update(window: IWindow, xScale: (x: number) => number) {
    this.window = window;
    this.xScale = xScale;
    if (this.options.start && this.options.end) {
      this.updateTrack(xScale);
    }
    Array.from(this.node.querySelector('div.track-content').children).forEach((elem: HTMLElement, i) => {
      this.updateLocation(this.data[i], elem, xScale, window);
    });
  }

  private updateTrack(xScale: (x: number) => number) {
    const track = <HTMLElement>this.node;
    track.style.width = `${Math.max(xScale(this.options.end) - xScale(this.options.start), 1)}px`;
    track.style.transform = `translateX(${xScale(this.options.start)}px)`;
  }

  protected abstract createLocation(item: T);
  protected abstract updateLocation(item: T, node: HTMLElement, xScale: (x: number) => number, window: IWindow);
}
