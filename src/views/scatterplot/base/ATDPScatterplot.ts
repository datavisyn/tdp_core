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

import { IDTypeLike } from '../../../idtype/IDType';
import { IRow } from '../../../base/rest';
import { AView } from '../../AView';
import { ISelection, IViewContext } from '../../../base/interfaces';
import { BaseUtils } from '../../../base/BaseUtils';
import { IDTypeManager } from '../../../idtype/IDTypeManager';
import { IScatterplotOptions } from './AScatterplot';
import { Scatterplot } from './Scatterplot';
import { ATrack } from '../tracks/ATrack';

export interface IAScatterplotOptions {
  itemIDType: IDTypeLike | string;
}

export abstract class ATDPScatterplot<T extends IRow> extends AView {
  protected plot: Scatterplot<T>;

  private readonly tracks: ATrack<any>[] = [];

  /*
   * Debouncing the render function to call the render method 200 milliseconds after the ViewWrapper calls the update method
   * Otherwise the canvas would render without width and height when resizing the views in dTiles, because it's set to display: none and therefore takes no space
   */
  readonly update = BaseUtils.debounce(() => {
    this.plot.render();
    this.tracks.forEach((track) => {
      track.update(this.plot.window, this.plot.transformedScales().x);
    });
  }, 200);

  private options: Readonly<IAScatterplotOptions> = {
    itemIDType: null,
  };

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IAScatterplotOptions> = {}) {
    super(context, selection, parent);
    Object.assign(this.options, options);

    this.node.classList.add('tdp-scatterplot');
  }

  protected async buildPlot(props: Partial<IScatterplotOptions<T>> = {}, parent = this.node) {
    const data = await this.loadRows();
    const options = { ...this.getScatterplotOptions(), ...props };

    this.plot = new Scatterplot<T>(data, parent, options);

    if (this.itemIDType) {
      this.plot.on(Scatterplot.EVENT_SELECTION_CHANGED, (instance: Scatterplot<T>) => {
        const selection: ISelection = {
          idtype: this.itemIDType,
          ids: instance.selection.map((item: T) => item.id),
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

  protected selectionChanged() {
    this.updateData();
  }

  async updateData() {
    this.plot.data = await this.loadRows(); // reload rows and set the data
  }

  pushTrack(track: ATrack<any>) {
    this.tracks.push(track);
    if (this.plot) {
      this.plot.node.parentElement!.insertAdjacentElement(track.position === 'beforePlot' ? 'afterbegin' : 'beforeend', track.node);
      this.plot.on(Scatterplot.EVENT_WINDOW_CHANGED, (window, scales) => {
        track.update(window, scales.x);
      });
      track.update(this.plot.window, this.plot.transformedScales().x);
    }
  }

  clearTracks() {
    this.tracks.length = 0;
  }

  /**
   * Override this method to return the dataset
   * @returns {Promise<T> | T}
   */
  protected abstract loadRows(): Promise<T[]> | T[];

  /**
   * Override this method to return options for the scatterplot, like minima and maxima for the x and y axes, data accessors, etc.
   * @returns {IScatterplotOptions<T>}
   */
  protected abstract getScatterplotOptions(): Partial<IScatterplotOptions<T>>;
}
