import { PluginRegistry } from 'visyn_core/plugin';
import type { ITDPTourExtensionDesc, IStep } from './extensions';
import { AppHeader } from '../components/header';
import { TourUtils } from './TourUtils';

export interface ITourContext {
  /**
   * The TDP application
   */
  app(): Promise<any>;

  /**
   * The application header
   */
  header(): AppHeader;

  /**
   * Set the number of steps
   * @param count Total number of steps
   */
  steps(count: number): void;

  /**
   * Show a given step
   * @param stepNumber The step number
   * @param step Step object
   */
  show(stepNumber: number, step: IStep): void;

  /**
   * Hide the tour
   * @param finished Flag whether the tour has finished
   */
  hide(finished?: boolean): void;
}

export class Tour {
  private current = -1;

  private steps: IStep[] = [];

  constructor(public readonly desc: ITDPTourExtensionDesc) {}

  get multiPage() {
    return this.desc.multiPage === true;
  }

  get id() {
    return this.desc.id;
  }

  get name() {
    return this.desc.name;
  }

  get description() {
    return this.desc.description;
  }

  canBeListed() {
    if (this.desc.level === 'manual') {
      return false;
    }
    if (typeof this.desc.availableIf === 'string') {
      return document.querySelector(this.desc.availableIf) != null;
    }
    if (typeof this.desc.availableIf === 'function') {
      return this.desc.availableIf.call(this.desc);
    }
    return true;
  }

  reset() {
    this.current = -1;
  }

  async start(context: ITourContext) {
    return this.jumpTo(0, context);
  }

  private loadSteps() {
    return this.desc.load().then((p) => {
      this.steps = p.factory();
    });
  }

  next(context: ITourContext) {
    return this.jumpTo(this.current + 1, context);
  }

  async jumpTo(step: number, context: ITourContext) {
    if (this.steps.length === 0) {
      await this.loadSteps();
      context.steps(this.steps.length);
    }

    if (step === this.current) {
      return;
    }

    if (this.current >= 0) {
      const before = this.steps[this.current];
      if (before.postAction) {
        await before.postAction.call(before, context);
      }
    }

    if (step < 0 || step >= this.steps.length) {
      this.current = -1;
      context.hide(step >= this.steps.length);
      return;
    }

    this.current = step;
    const next = this.steps[this.current];
    if (next.preAction) {
      await next.preAction.call(next, context);
    }
    context.show(this.current, next);
  }

  previous(context: ITourContext) {
    return this.jumpTo(this.current - 1, context);
  }

  /**
   * Refresh current step, e.g., when resizing the browser window
   * @param context tour context
   */
  refreshCurrent(context: ITourContext) {
    return context.show(this.current, this.steps[this.current]);
  }

  static resolveTours() {
    const tours = <ITDPTourExtensionDesc[]>PluginRegistry.getInstance().listPlugins(TourUtils.EXTENSION_POINT_TDP_TOUR);

    return tours.map((d) => new Tour(d));
  }
}
