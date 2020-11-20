import {IPlugin, EventHandler} from 'phovea_core';
import {Placement, PopperOptions} from 'popper.js';
import {AppHeader} from 'phovea_ui';
import {IViewPluginDesc, IView, ISelection} from '../base/interfaces';


export interface ITDPTourExtensionDesc {
  /**
   * The id of the tour.
   */
  id: string;

  /**
   * The name of the tour.
   */
  name: string;

  /**
   * An optional description of the tour.
   */
  description?: string;

  /**
   * Set a level for the tour.
   * Note: Manual tours are only triggered on demand via event.
   */
  level?: 'beginner' | 'advanced' | 'manual';

  /**
   * Set a condition when this tour should be available.
   * Accepts a function which returns a boolean; the tour is only available if this function returns `true`.
   * In case of a string value, the string is used as a selector to match an DOM element.
   */
  availableIf?: string | (() => boolean);

  /**
   * States whether this tour spans over multiple pages (i.e., contains page refreshes).
   * If set to `true` at least a single step of this tour must contain the `pageBreak` property.
   */
  multiPage?: boolean;

  /**
   * States whether the user can influence the order of the tour like jumping around or go back.
   */
  canJumpAround?: boolean;

  load(): Promise<IPlugin & ITDPTourExtension>;
}

export interface ITDPTourExtension {
  desc: ITDPTourExtensionDesc;
  factory(): IStep[];
}

export interface IStepContext {
  /**
   * The TDP application
   */
  app(): Promise<any>;

  /**
   * The application header
   */
  header(): AppHeader;

  /**
   * Further properties in case of a custom context upon manual triggering
   */
  [key: string]: any;
}

export interface IStep {
  /**
   * CSS selector for the element the current step is describing.
   * A grey transparent overlay will be laid over the app and
   * only the element with a matching selector is highlighted by clipping it out.
   */
  selector?: string | string[];

  /**
   * Contains html text to display.
   */
  html: string | ((node: HTMLElement)=>void);

  /**
   * Optional property that allows more precise popper placement.
   * The value `centered` places the element in the center of the screen but avoids the highlighted element.
   * @default auto
   */
  placement?: Placement | ((options: PopperOptions)=>void) | 'centered';

  /**
   * Is executed before the step is shown.
   * @param context
   */
  preAction?(context: IStepContext): any | PromiseLike<any>;

  /**
   * Waits for this function to return either `next` to automatically go to the next step or `enable` to enable the next button only.
   */
  waitFor?(context: IStepContext): Promise<'next'|'enable'>;

  /**
   * Is executed after the step is shown.
   * @param context
   */
  postAction?(context: IStepContext): any | PromiseLike<any>;

  /**
   * Defines if the next page (after the current one) is a new page.
   * The value can either be `manual` or `user`.
   * Applies to multi page tours only.
   * @default null
   */
  pageBreak?: 'manual' | 'user';

  /**
   * States whether the user is allowed to interact with the focus element.
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

