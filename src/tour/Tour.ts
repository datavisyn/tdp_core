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
    this.current = 0;
    context.show(this.current, this.steps[this.current]);
  }

  private loadSteps() {
    return this.desc.load().then((p) => {
      this.steps = p.factory();
    });
  }

  next(context: ITourContext) {
    if (this.current >= this.steps.length - 1) {
      this.current = -1;
      context.hide();
    } else {
      context.show(++this.current, this.steps[this.current]);
    }
  }

  jumpTo(step: number, context: ITourContext) {
    if (step < 0 || step >= this.steps.length) {
      this.current = -1;
      context.hide();
    } else {
      context.show(this.current = step, this.steps[step]);
    }
  }

  previous(context: ITourContext) {
    if (this.current <= 0) {
      this.current = -1;
      context.hide();
    } else {
      context.show(--this.current, this.steps[this.current]);
    }
  }
}

export function resolveTours() {
  const tours = <ITDPTourExtensionDesc[]>list(EXTENSION_POINT_TDP_TOUR);

  return tours.map((d) => new Tour(d));
}
