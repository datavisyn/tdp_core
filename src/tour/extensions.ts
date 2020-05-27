import {IPlugin, EventHandler} from 'phovea_core';
import {Placement, PopperOptions} from 'popper.js';
import {AppHeader} from 'phovea_ui';
import {IViewPluginDesc, IView, ISelection} from '../base/interfaces';


export interface ITDPTourExtensionDesc {
  id: string;
  name: string;
  description?: string;
  // manual tours are only triggered on demand via event
  level?: 'beginner' | 'advanced' | 'manual';

  /**
   * condition whether this tour is available, can be a string = selector to match or a filter function
   */
  availableIf?: string | (() => boolean);

  /**
   * if this tour is over multiple pages / page refreshes, i.e. a step contans a `pageBreak`
   */
  multiPage?: boolean;

  /**
   * whether the user can influence the order of the tour like jumping around or go back
   */
  canJumpAround?: boolean;

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
  /**
   * selector to highlight element
   */
  selector?: string | string[];
  /**
   * html text to show
   */
  html: string | ((node: HTMLElement)=>void);
  /**
   * optional more precise popper placement
   * centered ... center of screen but avoid the highlighted element
   * @default auto
   */
  placement?: Placement | ((options: PopperOptions)=>void) | 'centered';
  /**
   * executed before the step is shown
   * @param context
   */
  preAction?(context: IStepContext): any | PromiseLike<any>;
  /**
   * wait for this function to return either 'next' to auto next to the next step or 'enable' to enable the next button only
   */
  waitFor?(context: IStepContext): Promise<'next'|'enable'>;
  /**
   * executed after the step is shown
   * @param context
   */
  postAction?(context: IStepContext): any | PromiseLike<any>;

  /**
   * in case of multi page tours whether after this is a new page
   * @default null
   */
  pageBreak?: 'manual' | 'user';

  /**
   * whether to allow that the user is interacting with the focus element
   * @default false
   */
  allowUserInteraction?: boolean;
}


export interface IViewTourContext {
  plugin: IViewPluginDesc;
  node: HTMLElement;
  instance: IView | null;
  selection: ISelection;
}

