import {list} from 'phovea_core/src/plugin';
import {EXTENSION_POINT_TDP_TOUR, ITDPTourExtensionDesc, IStep} from './extensions';

export interface ITourContext {
  steps(count: number): void;
  show(stepNumber: number, step: IStep): void;
  hide(): void;
}

export default class Tour {
  private current: number = -1;

  private steps: IStep[] = [];

  constructor(private readonly desc: ITDPTourExtensionDesc) {

  }

  get name() {
    return this.desc.name;
  }

  reset() {
    this.current = -1;
  }

  async start(context: ITourContext) {
    if (this.steps.length === 0) {
      await this.loadSteps();
    }

    context.steps(this.steps.length);
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
    if (step === this.current) {
      return;
    }

    if (this.current >= 0) {
      const before = this.steps[this.current];
      if (before.postAction) {
        await before.postAction();
      }
    }

    if (step < 0 || step >= this.steps.length) {
      this.current = -1;
      context.hide();
      return;
    }

    this.current = step;
    const next = this.steps[this.current];
    if (next.preAction) {
      await next.preAction();
    }
    context.show(this.current, next);
  }

  previous(context: ITourContext) {
    return this.jumpTo(this.current - 1, context);
  }
}

export function resolveTours() {
  const tours = <ITDPTourExtensionDesc[]>list(EXTENSION_POINT_TDP_TOUR);

  return tours.map((d) => new Tour(d));
}
