import {IPlugin} from 'phovea_core/src/plugin';
import {Placement} from 'popper.js';
import {fire} from 'phovea_core/src/event';
import {AppHeader} from 'phovea_ui/src/header';
import {IViewPluginDesc, IView, ISelection} from '../extensions';

export const GLOBAL_EVENT_START_TOUR = 'tdpStartTour';

export const EXTENSION_POINT_TDP_TOUR = 'tdpTour';

export interface ITDPTourExtensionDesc {
  id: string;
  name: string;
  description?: string;
  // manual tours are only triggered on demand via event
  level?: 'beginner' | 'advanced' | 'manual';

  load(): Promise<IPlugin & ITDPTourExtension>;
}

export interface ITDPTourExtension {
  desc: ITDPTourExtensionDesc;
  factory(): IStep[];
}

export interface IStepContext {
  app(): Promise<any>; // the TDP app
  header(): AppHeader;

  // in case of a custom context upon manual triggering
  [key: string]: any;
}

export interface IStep {
  selector?: string;
  html: string;
  placement?: Placement;
  preAction?(context: IStepContext): void | PromiseLike<any>;
  postAction?(context: IStepContext): void | PromiseLike<any>;
}

export function startTour(tourId: string, context: any = {}) {
  fire(GLOBAL_EVENT_START_TOUR, tourId, context);
}

export interface IViewTourContext {
  plugin: IViewPluginDesc;
  node: HTMLElement;
  instance: IView | null;
  selection: ISelection;
}

/**
 * start a view help tour
 * @param tourId the tour id to start
 * @param context view context as extra tour context
 */
export function startViewTour(tourId: string, context: IViewTourContext) {
  startTour(tourId, context);
}
